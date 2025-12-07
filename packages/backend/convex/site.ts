import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSiteConfig = query({
	args: {
		school: v.string(),
	},
	handler: async (ctx, args) => {
		if (args.school === "www") {
			return {
				school: "www",
				schoolName: "The OpenCourseWare Project",
				siteLogo: "https://www.opencourseware.org/logo.png",
				instagramUrl: "https://www.instagram.com/creekcshs/",
				siteHero:
					"The OpenCourseWare Project is a platform for free, high-quality resources to students at all levels of education",
				siteContributeLink: "https://www.opencourseware.org/contribute",
				club: {
					name: "The OpenCourseWare Project",
					email: "info@opencourseware.org",
				},
				personsContact: [],
			};
		}
		const siteConfig = await ctx.db
			.query("siteConfig")
			.withIndex("by_school", (q) => q.eq("school", args.school))
			.first();

		if (!siteConfig) {
			return null;
		}

		return siteConfig;
	},
});

export const getSites = query({
	args: {},
	handler: async (ctx) => {
		const sites = await ctx.db.query("siteConfig").collect();
		return sites;
	},
});

export const updateSiteConfigBasicFields = mutation({
	args: {
		school: v.string(),
		schoolName: v.string(),
		siteHero: v.optional(v.string()),
		siteLogo: v.optional(v.string()),
		instagramUrl: v.optional(v.string()),
		siteContributeLink: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const siteConfig = await ctx.db
			.query("siteConfig")
			.withIndex("by_school", (q) => q.eq("school", args.school))
			.first();

		if (!siteConfig) {
			throw new ConvexError("Site configuration not found");
		}

		await ctx.db.patch(siteConfig._id, {
			schoolName: args.schoolName,
			siteHero: args.siteHero,
			siteLogo: args.siteLogo,
			instagramUrl: args.instagramUrl,
			siteContributeLink: args.siteContributeLink,
		});

		return null;
	},
});

export const updateClubInfo = mutation({
	args: {
		school: v.string(),
		clubName: v.string(),
		clubEmail: v.string(),
	},
	handler: async (ctx, args) => {
		const siteConfig = await ctx.db
			.query("siteConfig")
			.withIndex("by_school", (q) => q.eq("school", args.school))
			.first();

		if (!siteConfig) {
			throw new ConvexError("Site configuration not found");
		}

		await ctx.db.patch(siteConfig._id, {
			club: {
				name: args.clubName,
				email: args.clubEmail,
			},
		});

		return null;
	},
});

export const getContributors = query({
	args: {
		school: v.string(),
	},
	handler: async (ctx, args) => {
		if (args.school === "www") {
			return [];
		}
		const contributors = await ctx.db
			.query("contributors")
			.withIndex("by_school_and_order", (q) => q.eq("school", args.school))
			.collect();

		// Sort by order to ensure correct ordering
		return contributors.sort((a, b) => a.order - b.order);
	},
});

export const createContributor = mutation({
	args: {
		school: v.string(),
		name: v.string(),
		role: v.string(),
		avatar: v.string(),
		description: v.string(),
	},
	handler: async (ctx, args) => {
		// Get the max order value for this school
		const existingContributors = await ctx.db
			.query("contributors")
			.withIndex("by_school", (q) => q.eq("school", args.school))
			.collect();

		const maxOrder =
			existingContributors.length > 0
				? Math.max(...existingContributors.map((c) => c.order))
				: -1;

		const contributorId = await ctx.db.insert("contributors", {
			school: args.school,
			name: args.name,
			role: args.role,
			avatar: args.avatar,
			description: args.description,
			order: maxOrder + 1,
		});

		return contributorId;
	},
});

export const updateContributor = mutation({
	args: {
		contributorId: v.id("contributors"),
		name: v.optional(v.string()),
		role: v.optional(v.string()),
		avatar: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { contributorId, ...updates } = args;
		const contributor = await ctx.db.get(contributorId);

		if (!contributor) {
			throw new ConvexError("Contributor not found");
		}

		const patchData: {
			name?: string;
			role?: string;
			avatar?: string;
			description?: string;
		} = {};

		if (updates.name !== undefined) patchData.name = updates.name;
		if (updates.role !== undefined) patchData.role = updates.role;
		if (updates.avatar !== undefined) patchData.avatar = updates.avatar;
		if (updates.description !== undefined)
			patchData.description = updates.description;

		await ctx.db.patch(contributorId, patchData);

		return null;
	},
});

export const deleteContributor = mutation({
	args: {
		contributorId: v.id("contributors"),
	},
	handler: async (ctx, args) => {
		const contributor = await ctx.db.get(args.contributorId);

		if (!contributor) {
			throw new ConvexError("Contributor not found");
		}

		await ctx.db.delete(args.contributorId);

		// Reorder remaining contributors
		const remainingContributors = await ctx.db
			.query("contributors")
			.withIndex("by_school_and_order", (q) =>
				q.eq("school", contributor.school),
			)
			.collect();

		// Sort by order and reassign order values
		const sorted = remainingContributors.sort((a, b) => a.order - b.order);
		for (let i = 0; i < sorted.length; i++) {
			if (sorted[i].order !== i) {
				await ctx.db.patch(sorted[i]._id, { order: i });
			}
		}

		return null;
	},
});

export const reorderContributors = mutation({
	args: {
		school: v.string(),
		contributorIds: v.array(v.id("contributors")),
	},
	handler: async (ctx, args) => {
		// Verify all contributors belong to the same school
		for (const id of args.contributorIds) {
			const contributor = await ctx.db.get(id);
			if (!contributor) {
				throw new ConvexError(`Contributor ${id} not found`);
			}
			if (contributor.school !== args.school) {
				throw new ConvexError(
					`Contributor ${id} does not belong to school ${args.school}`,
				);
			}
		}

		// Update order for each contributor
		for (let i = 0; i < args.contributorIds.length; i++) {
			await ctx.db.patch(args.contributorIds[i], { order: i });
		}

		return null;
	},
});

export const updatePersonsContact = mutation({
	args: {
		school: v.string(),
		personsContact: v.array(
			v.object({
				name: v.string(),
				email: v.string(),
				description: v.string(),
			}),
		),
	},
	handler: async (ctx, args) => {
		const siteConfig = await ctx.db
			.query("siteConfig")
			.withIndex("by_school", (q) => q.eq("school", args.school))
			.first();

		if (!siteConfig) {
			throw new ConvexError("Site configuration not found");
		}

		await ctx.db.patch(siteConfig._id, {
			personsContact: args.personsContact,
		});

		return null;
	},
});
