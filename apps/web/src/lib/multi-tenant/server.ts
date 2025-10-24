import "server-only";
import { headers } from "next/headers";

export async function extractSubdomain(): Promise<string | null> {
  const headersList = await headers();
  const subdomain = headersList.get("host");
  const discriminant = subdomain?.split(".")[0];

  return discriminant ?? null;
}
