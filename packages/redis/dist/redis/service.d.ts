import type { Effect } from "effect";
import { Context } from "effect";
export interface RedisOps {
    readonly get: <T>(key: string) => Effect.Effect<T | null>;
    readonly set: (key: string, value: unknown, options?: {
        ex?: number;
        nx?: boolean;
    }) => Effect.Effect<string | null>;
    readonly del: (key: string) => Effect.Effect<void>;
}
declare const RedisService_base: Context.TagClass<RedisService, "RedisService", RedisOps>;
export declare class RedisService extends RedisService_base {
}
export {};
//# sourceMappingURL=service.d.ts.map