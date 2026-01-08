import { Effect, Layer } from "effect";
import { RatelimitService } from "./service";
import type { RatelimitResult } from "./service";

const fallback = (): RatelimitResult => ({
  success: false,
  remaining: 0,
  reset: Date.now(),
});

export const RatelimitServiceLive = Layer.effect(
  RatelimitService,
  Effect.gen(function* () {
    const { ratelimit } = yield* Effect.promise(() => import("./client"));

    return {
      limit: (id: string) =>
        Effect.promise<RatelimitResult>(async () => {
          const result = await ratelimit.limit(id);
          return result as RatelimitResult;
        }).pipe(Effect.orElseSucceed(fallback)),
    };
  })
);