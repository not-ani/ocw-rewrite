import { createHash } from "node:crypto";
import { CACHE_TTL, STALE_TTL } from "./config";

export const hashUrl = (url: string): string =>
  createHash("sha256").update(url).digest("hex").slice(0, 16);

export const hashContent = (content: string): string =>
  createHash("md5").update(content).digest("hex");

export const isStale = (fetchedAt: number): boolean =>
  Date.now() - fetchedAt > CACHE_TTL * 1000;

export const isExpired = (fetchedAt: number): boolean =>
  Date.now() - fetchedAt > STALE_TTL * 1000;

export const getClientIp = (request: Request): string =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  request.headers.get("x-real-ip") ??
  request.headers.get("client-ip") ??
  "anonymous";
