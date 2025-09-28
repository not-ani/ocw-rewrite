/*
import { type MutationCtx, mutation } from "./_generated/server";

type TableName =
  | "courses"
  | "units"
  | "lessons"
  | "lessonEmbeds"
  | "easyNoteCards"
  | "courseUsers"
  | "logs";

type MigrationResult = {
  updated: Record<TableName, number>;
  notFound: Record<TableName, number>;
};

async function getConvexIdFromMaybeIdString<T extends TableName>(
  ctx: MutationCtx,
  table: T,
  value: string | null | undefined
): Promise<string | null> {
  if (!value) {
    return null;
  }
  const normalized = ctx.db.normalizeId(table, value);
  if (normalized) {
    const existing = await ctx.db.get(normalized);
    if (existing) {
      return normalized as unknown as string;
    }
  }
  return null;
}

async function lookupConvexIdByLegacyId<T extends TableName>(
  ctx: MutationCtx,
  table: T,
  legacyId: string | null | undefined
): Promise<string | null> {
  if (!legacyId) {
    return null;
  }
  const doc = await ctx.db
    .query(table)
    .filter((q) => q.eq(q.field("id"), legacyId))
    .first();
  return doc ? (doc._id as unknown as string) : null;
  }

export const migrateRelations = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const result: MigrationResult = {
      updated: {
        courses: 0,
        units: 0,
        lessons: 0,
        lessonEmbeds: 0,
        easyNoteCards: 0,
        courseUsers: 0,
        logs: 0,
      },
      notFound: {
        courses: 0,
        units: 0,
        lessons: 0,
        lessonEmbeds: 0,
        easyNoteCards: 0,
        courseUsers: 0,
        logs: 0,
      },
    };

    // units.courseId -> courses._id
    {
      const units = await ctx.db.query("units").collect();
      const promises = units.map(async (u: any) => {
        const asConvex = await getConvexIdFromMaybeIdString(
          ctx,
          "courses",
          u.courseId
        );
        let target: string | null = asConvex;
        if (!target) {
          target = await lookupConvexIdByLegacyId(ctx, "courses", u.courseId);
        }
        if (target) {
          if (u.courseId !== target) {
            await ctx.db.patch(u._id, { courseId: target });
            result.updated.units += 1;
          }
        } else {
          result.notFound.units += 1;
        }
      });
      await Promise.all(promises);
    }

    // lessons.courseId -> courses._id, lessons.unitId -> units._id
    {
      const lessons = await ctx.db.query("lessons").collect();
      const promises = lessons.map(async (l: any) => {
        let changed = false;

        // courseId
        {
          const asConvex = await getConvexIdFromMaybeIdString(
            ctx,
            "courses",
            l.courseId
          );
          let target: string | null = asConvex;
          if (!target)
            target = await lookupConvexIdByLegacyId(ctx, "courses", l.courseId);
          if (target) {
            if (l.courseId !== target) {
              l.courseId = target;
              changed = true;
            }
          } else {
            result.notFound.lessons += 1;
          }
        }

        // unitId
        {
          const asConvex = await getConvexIdFromMaybeIdString(
            ctx,
            "units",
            l.unitId
          );
          let target: string | null = asConvex;
          if (!target)
            target = await lookupConvexIdByLegacyId(ctx, "units", l.unitId);
          if (target) {
            if (l.unitId !== target) {
              l.unitId = target;
              changed = true;
            }
          } else {
            result.notFound.lessons += 1;
          }
        }

        if (changed) {
          await ctx.db.patch(l._id, {
            courseId: l.courseId,
            unitId: l.unitId,
          });
          result.updated.lessons += 1;
        }
      });
      await Promise.all(promises);
    }

    // lessonEmbeds.lessonId -> lessons._id
    {
      const embeds = await ctx.db.query("lessonEmbeds").collect();
      const promises = embeds.map(async (e: any) => {
        const asConvex = await getConvexIdFromMaybeIdString(
          ctx,
          "lessons",
          e.lessonId
        );
        let target: string | null = asConvex;
        if (!target)
          target = await lookupConvexIdByLegacyId(ctx, "lessons", e.lessonId);
        if (target) {
          if (e.lessonId !== target) {
            await ctx.db.patch(e._id, { lessonId: target });
            result.updated.lessonEmbeds += 1;
          }
        } else {
          result.notFound.lessonEmbeds += 1;
        }
      });
      await Promise.all(promises);
    }

    // easyNoteCards.unitId -> units._id (optional)
    {
      const cards = await ctx.db.query("easyNoteCards").collect();
      const promises = cards.map(async (c: any) => {
        if (!c.unitId) return;
        const asConvex = await getConvexIdFromMaybeIdString(
          ctx,
          "units",
          c.unitId
        );
        let target: string | null = asConvex;
        if (!target)
          target = await lookupConvexIdByLegacyId(ctx, "units", c.unitId);
        if (target) {
          if (c.unitId !== target) {
            await ctx.db.patch(c._id, { unitId: target });
            result.updated.easyNoteCards += 1;
          }
        } else {
          result.notFound.easyNoteCards += 1;
        }
      });
      await Promise.all(promises);
    }

    // courseUsers.courseId -> courses._id (userId left unchanged)
    {
      const courseUsers = await ctx.db.query("courseUsers").collect();
      const promises = courseUsers.map(async (cu: any) => {
        const asConvex = await getConvexIdFromMaybeIdString(
          ctx,
          "courses",
          cu.courseId
        );
        let target: string | null = asConvex;
        if (!target)
          target = await lookupConvexIdByLegacyId(ctx, "courses", cu.courseId);
        if (target) {
          if (cu.courseId !== target) {
            await ctx.db.patch(cu._id, { courseId: target });
            result.updated.courseUsers += 1;
          }
        } else {
          result.notFound.courseUsers += 1;
        }
      });
      await Promise.all(promises);
    }

    // logs: lessonId/unitId/courseId -> respective _id when present
    {
      const logs = await ctx.db.query("logs").collect();
      const promises = logs.map(async (log: any) => {
        let changed = false;

        if (log.courseId) {
          const asConvex = await getConvexIdFromMaybeIdString(
            ctx,
            "courses",
            log.courseId
          );
          let target: string | null = asConvex;
          if (!target)
            target = await lookupConvexIdByLegacyId(
              ctx,
              "courses",
              log.courseId
            );
          if (target) {
            if (log.courseId !== target) {
              log.courseId = target;
              changed = true;
            }
          } else {
            result.notFound.logs += 1;
          }
        }

        if (log.unitId) {
          const asConvex = await getConvexIdFromMaybeIdString(
            ctx,
            "units",
            log.unitId
          );
          let target: string | null = asConvex;
          if (!target)
            target = await lookupConvexIdByLegacyId(ctx, "units", log.unitId);
          if (target) {
            if (log.unitId !== target) {
              log.unitId = target;
              changed = true;
            }
          } else {
            result.notFound.logs += 1;
          }
        }

        if (log.lessonId) {
          const asConvex = await getConvexIdFromMaybeIdString(
            ctx,
            "lessons",
            log.lessonId
          );
          let target: string | null = asConvex;
          if (!target)
            target = await lookupConvexIdByLegacyId(
              ctx,
              "lessons",
              log.lessonId
            );
          if (target) {
            if (log.lessonId !== target) {
              log.lessonId = target;
              changed = true;
            }
          } else {
            result.notFound.logs += 1;
          }
        }

        if (changed) {
          await ctx.db.patch(log._id, {
            courseId: log.courseId ?? undefined,
            unitId: log.unitId ?? undefined,
            lessonId: log.lessonId ?? undefined,
          });
          result.updated.logs += 1;
        }
      });
      await Promise.all(promises);
    }

    return result;
  },
});
 */
