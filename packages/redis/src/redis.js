"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
var redis_1 = require("@upstash/redis");
exports.redis = redis_1.Redis.fromEnv();
