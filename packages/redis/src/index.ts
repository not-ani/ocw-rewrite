import { Layer } from "effect";
import { RedisServiceLive } from "./redis/live";
import { RatelimitServiceLive } from "./rate-limit/live";

export * from "./redis";
export * from "./rate-limit";

export const ServiceLive = Layer.merge(
  RedisServiceLive,
  RatelimitServiceLive
);