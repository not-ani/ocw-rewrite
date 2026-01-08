import { env } from "@ocw/env/web";

export const protocol =
	env.NODE_ENV === "production" ? "https" : "http";

export const rootDomain =
	env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3001";
