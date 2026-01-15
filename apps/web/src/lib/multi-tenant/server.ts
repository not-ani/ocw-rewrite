import "server-only";

import { headers } from "next/headers";
import { env } from "@/env";
import { protocol } from "../site";

export async function extractSubdomain(): Promise<string | null> {
  const headersList = await headers();

  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    parseHostFromReferer(headersList.get("referer")) ??
    "";

  const hostname = host.split(":")[0] ?? "";
  if (!hostname) return null;

  const parts = hostname.split(".");

  // localhost case: example "foo.localhost"
  if (parts.length === 2 && parts[1] === "localhost") {
    if (parts[0] !== "www") return parts[0] ?? null;
    return parts[0];
  }

  // general case: subdomain.domain.tld (length >= 3)
  if (parts.length >= 3) {
    if (parts[0] !== "www") return parts[0] ?? null;
  }

  return null;
}

function parseHostFromReferer(referer: string | null): string | null {
  if (!referer) return null;
  try {
    const url = new URL(referer);
    return url.host;
  } catch {
    return null;
  }
}

export async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    env.NEXT_PUBLIC_ROOT_DOMAIN ??
    "localhost:3001";
  const protocolToUse = host.includes("localhost") ? "http" : protocol;
  return `${protocolToUse}://${host}`;
}
