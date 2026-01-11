import type { Effect } from "effect";
import { Context } from "effect";
export interface RatelimitResult {
    success: boolean;
    remaining: number;
    reset: number;
}
declare const RatelimitService_base: Context.TagClass<RatelimitService, "RatelimitService", {
    readonly limit: (id: string) => Effect.Effect<RatelimitResult>;
}>;
export declare class RatelimitService extends RatelimitService_base {
}
export {};
//# sourceMappingURL=service.d.ts.map