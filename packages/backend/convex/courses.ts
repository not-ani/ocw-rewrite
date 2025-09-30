import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { GenericDatabaseReader } from "convex/server";
import { mutation, query, QueryCtx } from "./_generated/server";
import { assertEditorOrAdmin, getRequesterRole } from "./permissions";

export const getPaginatedCourses = query({
  args: {
    page: v.number(),
    limit: v.number(),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { page, limit, search } = args;
    const offset = (page - 1) * limit;

    let allCourses: Doc<"courses">[];

    if (search?.trim()) {
      allCourses = await ctx.db
        .query("courses")
        .withSearchIndex("search_name", (q) => q.search("name", search.trim()))
        .collect();
    } else {
      allCourses = await ctx.db
        .query("courses")
        .withIndex("by_is_public", (q) => q.eq("isPublic", true))
        .collect();
    }

    const totalCourses = allCourses.length;
    const totalPages = Math.ceil(totalCourses / limit);

    // Get paginated results
    const courses = allCourses.slice(offset, offset + limit);

    return {
      courses,
      totalCourses,
      totalPages,
      currentPage: page,
    };
  },
});

type SearchEntityKind = "course" | "unit" | "lesson";

type SearchResult =
  | {
    type: "course";
    id: Id<"courses">;
    name: string;
    description: string;
    unitLength: number;
  }
  | {
    type: "unit";
    id: Id<"units">;
    name: string;
    courseId: Id<"courses">;
    courseName: string;
  }
  | {
    type: "lesson";
    id: Id<"lessons">;
    name: string;
    courseId: Id<"courses">;
    courseName: string;
    unitId: Id<"units">;
    unitName: string;
  };

const MAX_RESULTS_PER_GROUP = 5;

async function searchCourses(db: QueryCtx["db"], term: string, limit: number) {
  return await db
    .query("courses")
    .withSearchIndex("search_name", (q) =>
      q.search("name", term).eq("isPublic", true)
    )
    .take(limit);
}

async function searchUnits(db: QueryCtx["db"], term: string, limit: number) {
  const matches = await db
    .query("units")
    .withSearchIndex("search_name", (q) => q.search("name", term))
    .take(limit * 3);

  return matches.filter((unit) => unit.isPublished).slice(0, limit);
}

async function searchLessons(
  db: QueryCtx["db"],
  term: string,
  limit: number
) {
  const matches = await db
    .query("lessons")
    .withSearchIndex("search_name", (q) => q.search("name", term))
    .take(limit * 3);

  return matches.filter((lesson) => lesson.isPublished).slice(0, limit);
}

function formatResults(
  courses: Doc<"courses">[],
  units: Doc<"units">[],
  lessons: Doc<"lessons">[]
): SearchResult[] {
  const courseResults: SearchResult[] = courses.map((course) => ({
    type: "course",
    id: course._id,
    name: course.name,
    description: course.description,
    unitLength: course.unitLength,
  }));

  const unitResults: SearchResult[] = units.map((unit) => ({
    type: "unit",
    id: unit._id,
    name: unit.name,
    courseId: unit.courseId,
    courseName: "", // patched below
  }));

  const lessonResults: SearchResult[] = lessons.map((lesson) => ({
    type: "lesson",
    id: lesson._id,
    name: lesson.name,
    courseId: lesson.courseId,
    courseName: "", // patched below
    unitId: lesson.unitId,
    unitName: "", // patched below
  }));

  return [...courseResults, ...unitResults, ...lessonResults];
}

async function hydrateResults(
  db: QueryCtx["db"],
  results: SearchResult[]
): Promise<SearchResult[]> {
  const courseIds = new Set<Id<"courses">>();
  const unitIds = new Set<Id<"units">>();

  for (const result of results) {
    if (result.type === "unit" || result.type === "lesson") {
      courseIds.add(result.courseId);
    }
    if (result.type === "lesson") {
      unitIds.add(result.unitId);
    }
  }

  const courses = await Promise.all(
    [...courseIds].map((courseId) => db.get(courseId))
  );

  const units = await Promise.all([...unitIds].map((unitId) => db.get(unitId)));

  const courseById = new Map(
    courses
      .filter((course): course is Doc<"courses"> => Boolean(course))
      .map((course) => [course._id, course])
  );
  const unitById = new Map(
    units
      .filter(
        (unit): unit is Doc<"units"> => Boolean(unit) && Boolean(unit?.isPublished)
      )
      .map((unit) => [unit._id, unit])
  );

  return results
    .map((result) => {
      if (result.type === "unit") {
        const course = courseById.get(result.courseId);
        if (!course || !course.isPublic) {
          return null;
        }

        return {
          ...result,
          courseName: course.name,
        } satisfies SearchResult;
      }

      if (result.type === "lesson") {
        const course = courseById.get(result.courseId);
        const unit = unitById.get(result.unitId);
        if (!course || !course.isPublic || !unit) {
          return null;
        }

        return {
          ...result,
          courseName: course.name,
          unitName: unit.name,
        } satisfies SearchResult;
      }

      if (result.type === "course") {
        return result;
      }

      return result;
    })
    .filter((result): result is SearchResult => result !== null);
}

export const searchEntities = query({
  args: {
    term: v.string(),
    include: v.optional(
      v.array(v.union(v.literal("course"), v.literal("unit"), v.literal("lesson")))
    ),
  },
  handler: async (ctx, args) => {
    const term = args.term.trim();

    if (term.length === 0) {
      return [] as SearchResult[];
    }

    const include = new Set<SearchEntityKind>(
      (args.include ?? ["course", "unit", "lesson"]) as SearchEntityKind[]
    );

    const [courses, units, lessons] = await Promise.all([
      include.has("course") ? searchCourses(ctx.db, term, MAX_RESULTS_PER_GROUP) : [],
      include.has("unit") ? searchUnits(ctx.db, term, MAX_RESULTS_PER_GROUP) : [],
      include.has("lesson")
        ? searchLessons(ctx.db, term, MAX_RESULTS_PER_GROUP)
        : [],
    ]);

    const results = formatResults(courses, units, lessons);
    const hydrated = await hydrateResults(ctx.db, results);

    return hydrated;
  },
});

export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course?.isPublic) {
      return null;
    }
    return course;
  },
});

export const getCourseWithUnitsAndLessons = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);

    if (!course) {
      return null;
    }

    const units = await ctx.db
      .query("units")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    const unitsWithLessons = await Promise.all(
      units.map(async (unit) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_unit_id", (q) => q.eq("unitId", unit._id))
          .collect();

        return {
          id: unit._id,
          order: unit.order,
          name: unit.name,
          lessons: lessons.map((lesson) => ({
            id: lesson._id,
            name: lesson.name,
            contentType: lesson.contentType,
          })),
        };
      })
    );

    return { ...course, _id: course._id, units: unitsWithLessons };
  },
});

export const getDashboardSummary = query({
  args: { courseId: v.id("courses"), userRole: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    const role = await getRequesterRole(ctx, args.courseId);
    assertEditorOrAdmin(role);

    const units = await ctx.db
      .query("units")
      .withIndex("by_course_id", (q) => q.eq("courseId", course._id))
      .collect();

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course_id", (q) => q.eq("courseId", course._id))
      .collect();

    const publishedUnits = units.filter((u) => u.isPublished).length;
    const publishedLessons = lessons.filter((l) => l.isPublished).length;

    const last10Logs = await ctx.db
      .query("logs")
      .withIndex("by_course_id", (q) => q.eq("courseId", course._id))
      .order("desc")
      .take(10);

    return {
      course: {
        id: course._id,
        name: course.name,
        description: course.description,
      },
      counts: {
        units: units.length,
        lessons: lessons.length,
        publishedUnits,
        publishedLessons,
      },
      recentActivity: last10Logs.map((l) => ({
        id: l._id,
        action: l.action,
        timestamp: l.timestamp ?? l._creationTime,
        userId: l.userId,
      })),
    } as const;
  },
});

export const getSidebarData = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return [];
    }

    const units = await ctx.db
      .query("units")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    const result = await Promise.all(
      units.map(async (unit) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_unit_and_order", (q) => q.eq("unitId", unit._id))
          .filter((q) => q.eq(q.field("isPublished"), true))
          .collect();

        const lessonsWithEmbeds = await Promise.all(
          lessons.map(async (lesson) => {
            const embeds = await ctx.db
              .query("lessonEmbeds")
              .withIndex("by_lesson_id", (q) => q.eq("lessonId", lesson._id))
              .unique();

            return {
              id: lesson._id,
              pureLink: lesson.pureLink,
              name: lesson.name,
              contentType: lesson.contentType,
              unitId: lesson.unitId,
              embeds,
            };
          })
        );

        return {
          id: unit._id,
          order: unit.order,
          name: unit.name,
          courseId: unit.courseId,
          course: {
            name: course.name,
            subjectId: course.subjectId,
          },
          lessons: lessonsWithEmbeds,
        };
      })
    );

    return result;
  },
});

export const normalizeUnitLengths = mutation({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();

    const updates = await Promise.all(
      courses.map(async (course) => {
        const unitCount = await ctx.db
          .query("units")
          .withIndex("by_course_id", (q) => q.eq("courseId", course._id))
          .collect()
          .then((units) => units.length);

        await ctx.db.patch(course._id, { unitLength: unitCount });

        return {
          courseId: course._id,
          courseName: course.name,
          oldUnitLength: course.unitLength,
          newUnitLength: unitCount,
        };
      })
    );

    return {
      message: "Unit lengths normalized successfully",
      updates,
    };
  },
});
