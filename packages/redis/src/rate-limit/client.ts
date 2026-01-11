import { Ratelimit } from "@upstash/ratelimit";
import { redisClient } from "../redis/client";

export const ratelimit = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
  });
  