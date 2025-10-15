import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);

export const setDefaultValue = migrations.define({
  table: "siteUser",
  migrateOne: async (ctx, doc) => {
    if (doc.school === undefined) {
      await ctx.db.patch(doc._id, { school: "creek" });
    }
  },
});

export const setDeafultVluae2 = migrations.define({
  table: "courses",
  migrateOne: async (ctx, doc) => {
    if (doc.school === undefined) {
      await ctx.db.patch(doc._id, { school: "creek" });
    }
  },
});

export const setDeafultVluae3 = migrations.define({
  table: "courseUsers",
  migrateOne: async (ctx, doc) => {
    if (doc.school === undefined) {
      await ctx.db.patch(doc._id, { school: "creek" });
    }
  },
});

export const setDeafultVluae4 = migrations.define({
  table: "units",
  migrateOne: async (ctx, doc) => {
    if (doc.school === undefined) {
      await ctx.db.patch(doc._id, { school: "creek" });
    }
  },
});

export const setDeafultVluae5 = migrations.define({
  table: "lessons",
  migrateOne: async (ctx, doc) => {
    if (doc.school === undefined) {
      await ctx.db.patch(doc._id, { school: "creek" });
    }
  },
});

export const setDeafultVluae6 = migrations.define({
  table: "lessonEmbeds",
  migrateOne: async (ctx, doc) => {
    if (doc.school === undefined) {
      await ctx.db.patch(doc._id, { school: "creek" });
    }
  },
});

export const setDeafultVluae7 = migrations.define({
  table: "logs",
  migrateOne: async (ctx, doc) => {
    if (doc.school === undefined) {
      await ctx.db.patch(doc._id, { school: "creek" });
    }
  },
});

export const runAll = migrations.runner([
  internal.migrations.setDefaultValue,
  internal.migrations.setDeafultVluae2,
  internal.migrations.setDeafultVluae3,
  internal.migrations.setDeafultVluae4,
  internal.migrations.setDeafultVluae5,
  internal.migrations.setDeafultVluae6,
  internal.migrations.setDeafultVluae7,
]);
