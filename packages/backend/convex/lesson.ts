import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertEditorOrAdmin, getRequesterRole } from "./permissions";

export const getLessonById = query({
  args: {
    id: v.id("lessons"),
    school: v.string(),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.id);

    const lessonEmbed = await ctx.db
      .query("lessonEmbeds")
      .withIndex("by_lesson_id", (q) => q.eq("lessonId", args.id))
      .first();

    return {
      lesson: {
        ...lesson,
      },
      embed: {
        ...lessonEmbed,
      },
    };
  },
});

export const getLessonMetadata = query({
  args: {
    id: v.id("lessons"),
    school: v.string(),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.id);
    
    if (!lesson) {
      return null;
    }
    
    // Return only the essential data needed for metadata
    return {
      id: lesson._id,
      name: lesson.name,
      unitId: lesson.unitId,
    };
  },
});

function detectEmbed(input: string): {
  contentType: "google_docs" | "quizlet" | "notion" | "tiptap" | "flashcard";
  embedUrl?: string;
} | null {
  const iframeSrcMatch = input.match(/src="([^"]+)"/);
  const url = iframeSrcMatch ? iframeSrcMatch[1] : input.trim();

  try {
    const u = new URL(url);

    if (u.hostname.includes("drive.google.com")) {
      // Normalize Google Drive file links to use `/preview`
      const match = u.pathname.match(/\/file\/d\/([^/]+)/);
      if (match) {
        const fileId = match[1];
        return {
          contentType: "google_docs",
          embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        };
      }
      return { contentType: "google_docs", embedUrl: u.toString() };
    }

    if (u.hostname.includes("docs.google.com")) {
      return { contentType: "google_docs", embedUrl: u.toString() };
    }

    if (u.hostname.includes("quizlet.com")) {
      return { contentType: "quizlet", embedUrl: u.toString() };
    }

    if (u.hostname.includes("notion.so") || u.hostname.includes("notion.site")) {
      return { contentType: "notion", embedUrl: u.toString() };
    }
  } catch {
    return null;
  }

  return null;
}

export const createOrUpdateEmbed = mutation({
  args: {
    lessonId: v.id("lessons"),
    raw: v.string(),
    school: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const detected = detectEmbed(args.raw);
    if (!detected) {
      throw new Error("Unsupported embed");
    }

    // Update lesson contentType if mismatched
    if (lesson.contentType !== detected.contentType) {
      await ctx.db.patch(args.lessonId, { contentType: detected.contentType });
    }

    const existing = await ctx.db
      .query("lessonEmbeds")
      .withIndex("by_lesson_id", (q) => q.eq("lessonId", args.lessonId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        embedUrl: detected.embedUrl ?? existing.embedUrl,
      });
    } else {
      await ctx.db.insert("lessonEmbeds", {
        lessonId: args.lessonId,
        embedUrl: detected.embedUrl ?? "",
        school: args.school,
      });
    }

    await ctx.db.insert("logs", {
      userId: identity.subject,
      courseId: lesson.courseId,
      unitId: lesson.unitId,
      lessonId: args.lessonId,
      action: "UPDATE_LESSON",
      school: args.school,
      timestamp: Date.now(),
    });
  },
});
export const getByUnit = query({
  args: { unitId: v.id("units"), school: v.string() },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_unit_id", (q) => q.eq("unitId", args.unitId))
      .order("asc")
      .collect();

    return lessons.map((l) => ({
      id: l._id,
      name: l.name,
      isPublished: l.isPublished,
      order: l.order,
      contentType: l.contentType,
    }));
  },
});

export const searchByCourse = query({
  args: {
    courseId: v.id("courses"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return [];
    }

    const lessons = await ctx.db
      .query("lessons")
      .withSearchIndex("search_name", (q) =>
        q.search("name", args.searchTerm).eq("courseId", args.courseId)
      )
      .take(10);

    // Get unit names for each lesson
    const lessonsWithUnits = await Promise.all(
      lessons.map(async (lesson) => {
        const unit = await ctx.db.get(lesson.unitId);
        return {
          id: lesson._id,
          name: lesson.name,
          unitId: lesson.unitId,
          unitName: unit?.name ?? "Unknown Unit",
          isPublished: lesson.isPublished,
          contentType: lesson.contentType,
        };
      })
    );

    return lessonsWithUnits;
  },
});

export const create = mutation({
  args: {
    courseId: v.id("courses"),
    unitId: v.id("units"),
    name: v.string(),
    embedRaw: v.optional(v.string()),
    school: v.string(),
  },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId, args.school);
    assertEditorOrAdmin(role);

    const existing = await ctx.db
      .query("lessons")
      .withIndex("by_unit_id", (q) => q.eq("unitId", args.unitId))
      .collect();
    const order = existing.length;

    const detected = args.embedRaw ? detectEmbed(args.embedRaw) : null;

    const lessonId = await ctx.db.insert("lessons", {
      order,
      isPublished: false,
      pureLink: true,
      contentType: detected?.contentType ?? "tiptap",
      courseId: args.courseId,
      unitId: args.unitId,
      name: args.name,
      content: undefined,
      school: args.school,
    });

    if (detected?.embedUrl) {
      await ctx.db.insert("lessonEmbeds", {
        lessonId,
        embedUrl: detected.embedUrl,
        password: undefined,
        school: args.school,
      });
    }

    await ctx.db.insert("logs", {
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
      courseId: args.courseId,
      unitId: args.unitId,
      lessonId,
      action: "CREATE_LESSON",
      school: args.school,
      timestamp: Date.now(),
    });

    return lessonId;
  },
});

export const update = mutation({
  args: {
    courseId: v.id("courses"),
    data: v.object({
      id: v.id("lessons"),
      name: v.optional(v.string()),
      isPublished: v.optional(v.boolean()),
      unitId: v.optional(v.id("units")),
      content: v.optional(v.union(v.any(), v.null())),
    }),
    school: v.string(),
  },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId, args.school);
    assertEditorOrAdmin(role);
    const lesson = await ctx.db.get(args.data.id);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await ctx.db.patch(args.data.id, {
      name: args.data.name ?? lesson.name,
      isPublished: args.data.isPublished ?? lesson.isPublished,
      unitId: args.data.unitId ?? lesson.unitId,
      content:
        args.data.content === undefined
          ? lesson.content
          : (args.data.content ?? undefined),
    });

    await ctx.db.insert("logs", {
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
      courseId: lesson.courseId,
      unitId: lesson.unitId,
      lessonId: args.data.id,
      action: "UPDATE_LESSON",
      school: args.school,
      timestamp: Date.now(),
    });
  },
});

export const reorder = mutation({
  args: {
    courseId: v.id("courses"),
    unitId: v.id("units"),
    data: v.array(v.object({ id: v.id("lessons"), position: v.number() })),
    school: v.string(),
  },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId, args.school);
    assertEditorOrAdmin(role);
    for (const item of args.data) {
      const lesson = await ctx.db.get(item.id);
      if (
        lesson &&
        lesson.unitId === args.unitId &&
        lesson.order !== item.position
      ) {
        await ctx.db.patch(item.id, { order: item.position });
      }
    }

    await ctx.db.insert("logs", {
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
      courseId: args.courseId,
      unitId: args.unitId,
      action: "REORDER_LESSON",
      school: args.school,
      timestamp: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { courseId: v.id("courses"), id: v.id("lessons"), school: v.string() },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId, args.school);
    assertEditorOrAdmin(role);
    const lesson = await ctx.db.get(args.id);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await ctx.db.delete(args.id);

    // Re-number remaining lessons within unit
    const remaining = await ctx.db
      .query("lessons")
      .withIndex("by_unit_id", (q) => q.eq("unitId", lesson.unitId))
      .order("asc")
      .collect();
    for (const [index, l] of remaining.entries()) {
      if (l.order !== index) {
        await ctx.db.patch(l._id, { order: index });
      }
    }

    await ctx.db.insert("logs", {
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
      courseId: lesson.courseId,
      unitId: lesson.unitId,
      lessonId: args.id,
      action: "DELETE_LESSON",
      school: args.school,
      timestamp: Date.now(),
    });
  },
});
