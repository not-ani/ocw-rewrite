import "server-only";
import { headers } from "next/headers";

export async function extractSubdomain(): Promise<string | null> {
  const headersList = await headers();
  const subdomain = headersList.get("host");
  console.log(subdomain + "subdomain")
  const discriminant = subdomain?.split(".")[0];
  console.log("disc" + discriminant)

  return discriminant ?? null;
}
