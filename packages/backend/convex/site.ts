import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";

export const getSiteConfig = query({
  args: {
    school: v.string(),
  },
  handler: async (ctx, args) => {
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
