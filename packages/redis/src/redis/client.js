"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
var redis_1 = require("@upstash/redis");
exports.redisClient = redis_1.Redis.fromEnv();
