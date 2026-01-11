import type { Effect } from "effect";
import { Context } from "effect";

export interface RatelimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export class RatelimitService extends Context.Tag("RatelimitService")<
  RatelimitService,
  {
    readonly limit: (id: string) => Effect.Effect<RatelimitResult>;
  }
>() {}