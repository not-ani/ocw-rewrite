import { Effect, Layer } from "effect";
import { RatelimitService } from "./service";
import type { RatelimitResult } from "./service";
import { ratelimit } from "./client";

const fallback = (): RatelimitResult => ({
  success: false,
  remaining: 0,
  reset: Date.now(),
});

export const RatelimitServiceLive = Layer.succeed(RatelimitService, {
  limit: (id: string) =>
    Effect.promise<RatelimitResult>(async () => {
      const result = await ratelimit.limit(id);
      return result as RatelimitResult;
    }).pipe(Effect.orElseSucceed(fallback)),
});