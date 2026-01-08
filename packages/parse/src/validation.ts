import { Effect } from "effect";
import dns from "node:dns";
import { BlockedHostError, InvalidUrlError } from "./errors";
import { ALLOWED_HOSTS } from "./config";

export const PRIVATE_IPV4_CIDRS: [number, number][] = [
  [0x0a000000, 0xff000000],
  [0x7f000000, 0xff000000],
  [0xa9fe0000, 0xffff0000],
  [0xac100000, 0xfff00000],
  [0xc0a80000, 0xffff0000],
  [0x64400000, 0xffc00000],
  [0xc6120000, 0xfffe0000],
  [0x00000000, 0xff000000],
];

export const isHostAllowlisted = (hostname: string) =>
  Effect.gen(function* () {
    if (ALLOWED_HOSTS.size === 0)
      yield* Effect.fail(
        new BlockedHostError({
          host: hostname,
          reason: "Host is not allowlisted",
        }),
      );
    const h = hostname.toLowerCase();
    if (ALLOWED_HOSTS.has(h)) return true;
    for (const allowed of ALLOWED_HOSTS) {
      if (h.endsWith(`.${allowed}`)) return true;
    }
    return false;
  });

export const parseAndValidateUrl = (
  requestUrl: string,
): Effect.Effect<URL, InvalidUrlError> =>
  Effect.try({
    try: () => {
      const { searchParams } = new URL(requestUrl);
      const url = searchParams.get("url");
      if (!url) throw new Error("URL parameter is required");
      const urlObj = new URL(url);
      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        throw new Error("Only http and https protocols are allowed");
      }
      return urlObj;
    },
    catch: (e) =>
      new InvalidUrlError({
        message: e instanceof Error ? e.message : "Invalid URL",
      }),
  });

export const validateHostSecurity = (
  urlObj: URL,
): Effect.Effect<void, BlockedHostError> =>
  Effect.gen(function* () {
    if (!isHostAllowlisted(urlObj.hostname)) {
      return yield* Effect.fail(
        new BlockedHostError({
          host: urlObj.hostname,
          reason: "Host is not allowlisted",
        }),
      );
    }
  });
