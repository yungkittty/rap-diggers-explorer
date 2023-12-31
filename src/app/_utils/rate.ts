import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { ErrorCode } from "../_constants/error-code";

const RATE_LIMIT_REDIS_KEY = "6eCo0bfzRgWeoK9pFt7v48yAKWHDWBVp";
const RATE_LIMIT_WINDOW_SIZE = 30_000; // milliseconds
const RATE_LIMIT_MAX_REQUESTS = 65;

const redis = new Redis({
  url: process.env.UPSTASH_REST_API_URL ?? "",
  token: process.env.UPSTASH_REST_API_TOKEN ?? "",
});

export const withRate =
  (
    options: { weight: number },
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
    const { weight } = options;

    const [, requestsCount] = await redis
      .multi()
      .zremrangebyscore(
        RATE_LIMIT_REDIS_KEY,
        0, // -inf
        Date.now() - RATE_LIMIT_WINDOW_SIZE,
      )
      .zcard(RATE_LIMIT_REDIS_KEY)
      .exec();

    const nextRequestsCount = requestsCount + 1 * weight;
    if (nextRequestsCount > RATE_LIMIT_MAX_REQUESTS) {
      return Response.json(
        { error: ErrorCode.USER_FORBIDDEN_MAX_REQUESTS },
        { status: 429 },
      );
    }

    const score = Date.now();
    const [
      nextRequest, //
      ...nextRequests
    ] = Array.from(
      { length: weight }, //
      () => ({ member: crypto.randomUUID(), score }),
    );

    await redis.zadd(
      RATE_LIMIT_REDIS_KEY, //
      nextRequest,
      ...nextRequests,
    );

    return callback(...args);
  };
