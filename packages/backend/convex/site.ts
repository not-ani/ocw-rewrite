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
				contributors: [],
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

export const updateContributors = mutation({
	args: {
		school: v.string(),
		contributors: v.array(
			v.object({
				name: v.string(),
				role: v.string(),
				avatar: v.string(),
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
			contributors: args.contributors,
		});

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
