import { inngest } from "@/inngest/client";
import { Redis } from "@upstash/redis";
import {
  GetEvents,
  GetFunctionInput,
  NonRetriableError,
  RetryAfterError,
} from "inngest";
import type { NextRequest } from "next/server";
import { ErrorCode } from "../_constants/error-code";
import {
  INNGEST_MAX_RETRIES,
  INNGEST_MAX_RETRIES_AFTER,
} from "../_constants/inngess";
import { CustomError } from "./errors";

const RATE_LIMIT_REDIS_KEY = "6eCo0bfzRgWeoK9pFt7v48yAKWHDWBVp";
const RATE_LIMIT_WINDOW_SIZE = 30_000; // milliseconds
const RATE_LIMIT_MAX_REQUESTS = 65;

const redis = new Redis({
  url: process.env.UPSTASH_REST_API_URL ?? "",
  token: process.env.UPSTASH_REST_API_TOKEN ?? "",
});

type RateOptions = { weight: number };
const rate = async (options: RateOptions) => {
  const { weight } = options;

  const [, count] = await redis
    .multi()
    .zremrangebyscore(
      RATE_LIMIT_REDIS_KEY,
      0, // -inf
      Date.now() - RATE_LIMIT_WINDOW_SIZE,
    )
    .zcard(RATE_LIMIT_REDIS_KEY)
    .exec();

  const count_ = count + 1 * weight;
  if (count_ > RATE_LIMIT_MAX_REQUESTS) {
    throw new CustomError(ErrorCode.USER_FORBIDDEN_MAX_REQUESTS);
  }

  const score = Date.now();
  const [
    member, //
    ...members
  ] = Array.from(
    { length: weight }, //
    () => ({ member: crypto.randomUUID(), score }),
  );

  await redis.zadd(
    RATE_LIMIT_REDIS_KEY, //
    member,
    ...members,
  );
};

export const withRate =
  (
    options: RateOptions,
    callback: (
      ...args: [
        NextRequest, //
        { params: { [key: string]: string } },
      ]
    ) => Promise<Response>,
  ) =>
  async (
    ...args: [
      NextRequest, //
      { params: { [key: string]: string } },
    ]
  ): Promise<Response> => {
    try {
      await rate(options);
    } catch (error) {
      if (
        error instanceof CustomError &&
        error.code === ErrorCode.USER_FORBIDDEN_MAX_REQUESTS
      ) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN_MAX_REQUESTS }, //
          { status: 429 },
        );
      }
      return Response.json(
        { error: ErrorCode.UPSTASH_UNKNOWN }, //
        { status: 500 },
      );
    }
    return callback(...args);
  };

const RATE_LIMIT_RETRIES_AFTER = [
  1 * 60 * 1000, // 1 minute(s)
  3 * 60 * 1000, // 3 minute(s)
  5 * 60 * 1000, // 5 minute(s)
  10 * 60 * 1000, // 10 minute(s)
  INNGEST_MAX_RETRIES_AFTER,
];

export const withRateInngest =
  <T extends keyof GetEvents<typeof inngest>>(
    options: RateOptions, //
    callback: (
      params: GetFunctionInput<typeof inngest, T>, //
    ) => Promise<void>,
  ) =>
  async (
    params: GetFunctionInput<typeof inngest, T>, //
  ): Promise<void> => {
    const { attempt } = params;
    try {
      await rate(options);
    } catch (error) {
      if (attempt === INNGEST_MAX_RETRIES) {
        throw new NonRetriableError(
          ErrorCode.USER_FORBIDDEN_MAX_RETRIES, //
          { cause: error },
        );
      }
      if (
        error instanceof CustomError &&
        error.code === ErrorCode.USER_FORBIDDEN_MAX_REQUESTS
      ) {
        throw new RetryAfterError(
          ErrorCode.USER_FORBIDDEN_MAX_REQUESTS, //
          RATE_LIMIT_RETRIES_AFTER[attempt],
          { cause: error },
        );
      }
      throw new RetryAfterError(
        ErrorCode.UPSTASH_UNKNOWN, //
        INNGEST_MAX_RETRIES_AFTER,
        { cause: error },
      );
    }
    return callback(params);
  };
