import { createClient } from "@vercel/kv";
import type { NextRequest } from "next/server";
import { ErrorCode } from "../_constants/error-code";
import { sleep } from "./sleep";

const RATE_LIMIT_REDIS_KEY = "6eCo0bfzRgWeoK9pFt7v48yAKWHDWBVp";
const RATE_LIMIT_WINDOW_SIZE = 30_000; // milliseconds
const RATE_LIMIT_MAX_REQUESTS = 75;
const RATE_LIMIT_MAX_SLEEP = 1_000; // milliseconds

const kv = createClient({
  url: process.env.KV_REST_API_URL ?? "",
  token: process.env.KV_REST_API_TOKEN ?? "",
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

    const [, requestsCount, latestRequest] = await kv
      .multi()
      .zremrangebyscore(
        RATE_LIMIT_REDIS_KEY,
        0, // -inf
        Date.now() - RATE_LIMIT_WINDOW_SIZE,
      )
      .zcard(RATE_LIMIT_REDIS_KEY)
      .zrange<[string, number]>(
        RATE_LIMIT_REDIS_KEY, //
        0,
        0,
        { rev: true, withScores: true },
      )
      .exec();

    const nextRequestsCount = requestsCount + 1 * weight;

    if (nextRequestsCount > RATE_LIMIT_MAX_REQUESTS) {
      return Response.json(
        { error: ErrorCode.USER_FORBIDDEN_MAX_REQUESTS },
        { status: 429 },
      );
    }

    for (let loop = 0; loop < weight; loop++) {
      await kv.zadd(
        RATE_LIMIT_REDIS_KEY, //
        { member: crypto.randomUUID(), score: Date.now() },
      );
    }

    if (nextRequestsCount > RATE_LIMIT_MAX_REQUESTS * (2 / 3)) {
      const lastestRequestId = latestRequest[0];
      const lastestRequestScore = latestRequest[1];

      const leftWindowSize = Date.now() - lastestRequestScore;
      const leftRequestsCount = RATE_LIMIT_MAX_REQUESTS - nextRequestsCount;

      const milliseconds = Math.round(leftWindowSize / leftRequestsCount);
      if (milliseconds > RATE_LIMIT_MAX_SLEEP) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN_MAX_REQUESTS },
          { status: 429 },
        );
      }
      await sleep(milliseconds);
    }

    return callback(...args);
  };
