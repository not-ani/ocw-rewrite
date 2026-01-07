import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute
});
