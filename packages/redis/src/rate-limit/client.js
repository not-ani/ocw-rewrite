"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratelimit = void 0;
var ratelimit_1 = require("@upstash/ratelimit");
var client_1 = require("../redis/client");
exports.ratelimit = new ratelimit_1.Ratelimit({
    redis: client_1.redisClient,
    limiter: ratelimit_1.Ratelimit.slidingWindow(10, "10 s"),
});
