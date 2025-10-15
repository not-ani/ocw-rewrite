import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { rootDomain } from "./lib/site";

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(":")[0];
  console.log("rootDomainFormatted", rootDomainFormatted);

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    console.log("this is a preview deployment");
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  console.log("isSubdomain", isSubdomain);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const subdomain = extractSubdomain(req);

  console.log("subdomain", subdomain);

  if (subdomain) {
    // Block access to admin page from subdomains
    if (pathname.startsWith("/ocw-admin")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    console.log("redirecting to root");

    // For the root path on a subdomain, rewrite to the subdomain page
    if (pathname === "/") {
      console.log("redirecting to subdomain");
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, req.url));
    }
  }

  console.log("redirecting to root");
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
