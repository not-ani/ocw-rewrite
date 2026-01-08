import { env } from "@ocw/env/server";

export default {
	providers: [
		{
			// Replace with your own Clerk Issuer URL from your "convex" JWT template
			// or with `env.CLERK_JWT_ISSUER_DOMAIN`
			// and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
			// See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
			domain: env.CLERK_JWT_ISSUER_DOMAIN,
			applicationID: "convex",
		},
	],
};
