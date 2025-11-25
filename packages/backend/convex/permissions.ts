import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { query } from "./_generated/server";

type GetRequesterRole = {
	courseRole: "admin" | "editor" | "user" | null;
	siteRole: "admin" | null;
	school: string;
};

export async function getRequesterRole({
	ctx,
	courseId,
	school,
}: {
	ctx: QueryCtx;
	courseId?: Id<"courses">;
	school: string;
}): Promise<GetRequesterRole | null> {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		return null;
	}

	const siteUser = await ctx.db
		.query("siteUser")
		.withIndex("by_user_id_and_school", (q) =>
			q.eq("userId", identity.tokenIdentifier).eq("school", school),
		)
		.unique();

	if (!courseId) {
		if (siteUser?.role === "admin") {
			return {
				courseRole: "admin",
				school: siteUser.school,
				siteRole: "admin",
			};
		}
		return {
			courseRole: null,
			siteRole: null,
			school,
		};
	}
	const membership = await ctx.db
		.query("courseUsers")
		.withIndex("by_course_and_user_and_school", (q) =>
			q
				.eq("courseId", courseId)
				.eq("userId", identity.tokenIdentifier)
				.eq("school", school),
		)
		.unique();
	return {
		courseRole: membership?.role ?? null,
		siteRole: siteUser?.role ?? null,
		school: school,
	};
}
export const getSiteUser = query({
	args: { school: v.string() },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			return null;
		}
		return await ctx.db
			.query("siteUser")
			.withIndex("by_user_id_and_school", (q) =>
				q.eq("userId", identity.tokenIdentifier).eq("school", args.school),
			)
			.unique();
	},
});

export function assertEditorOrAdmin(requesterInfo: GetRequesterRole | null) {
	const hasCourseRole =
		requesterInfo?.courseRole === "admin" ||
		requesterInfo?.courseRole === "editor";

	const hasSiteRole = requesterInfo?.siteRole === "admin";
	if (!(hasCourseRole || hasSiteRole)) {
		throw new Error("Not authorized");
	}
}

export function assertSiteAdmin(requesterInfo: GetRequesterRole | null) {
	const hasSiteRole = requesterInfo?.siteRole === "admin";

	if (!hasSiteRole) {
		throw new ConvexError("Not authorized is not site admin");
	}
}
