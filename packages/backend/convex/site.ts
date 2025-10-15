import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";

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
        siteHero: "The OpenCourseWare Project is a platform for free, high-quality resources to students at all levels of education",
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
  handler: async (ctx) => {
    const sites = await ctx.db.query("siteConfig").collect();
    return sites;
  },
});
