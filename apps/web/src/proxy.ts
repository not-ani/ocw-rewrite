import { clerkMiddleware } from "@clerk/nextjs/server";

// Authentication is enforced at each private resource boundary. Keeping this
// proxy narrowly matched avoids paying for a separate Node invocation on public
// pages, metadata routes, static assets, and analytics requests.
export default clerkMiddleware();

export const config = {
	matcher: [
		"/admin/:path*",
		"/course/:id/dashboard/:path*",
		"/api/clerk-users",
		"/api/uploadthing/:path*",
	],
};
