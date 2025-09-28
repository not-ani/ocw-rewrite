import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  siteUser: defineTable({
    userId: v.string(),
    role: v.union(v.literal("admin")),
  }).index("by_user_id", ["userId"]),
  courses: defineTable({
    //optional for legacy db
    id: v.optional(v.string()),
    // subjuect Id stays a string for now
    subjectId: v.string(),
    name: v.string(),
    aliases: v.array(v.string()),
    isPublic: v.boolean(),
    imageUrl: v.optional(v.string()),
    unitLength: v.number(),
    description: v.string(),
  })
    .index("by_is_public", ["isPublic"])
    .index("by_subject_id", ["subjectId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["isPublic", "subjectId"],
    })
    .searchIndex("search_description", {
      searchField: "description",
      filterFields: ["isPublic", "subjectId"],
    }),

  courseUsers: defineTable({
    id: v.optional(v.string()),
    courseId: v.id("courses"),
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("user")),
    permissions: v.optional(
      v.array(
        v.union(
          v.literal("create_unit"),
          v.literal("edit_unit"),
          v.literal("delete_unit"),
          v.literal("create_lesson"),
          v.literal("edit_lesson"),
          v.literal("delete_lesson"),
          v.literal("reorder_lesson"),
          v.literal("manage_users"),
          v.literal("manage_course")
        )
      )
    ),
  })
    .index("by_course_id", ["courseId"])
    .index("by_user_id", ["userId"])
    .index("by_course_and_user", ["courseId", "userId"])
    .index("by_role", ["role"]),

  units: defineTable({
    id: v.optional(v.string()),
    courseId: v.id("courses"),
    name: v.string(),
    description: v.optional(v.string()),
    isPublished: v.boolean(),
    order: v.number(),
  })
    .index("by_course_id", ["courseId"])
    .index("by_course_and_order", ["courseId", "order"])
    .index("by_is_published", ["isPublished"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["courseId", "isPublished"],
    })
    .searchIndex("search_description", {
      searchField: "description",
      filterFields: ["courseId", "isPublished"],
    }),

  lessons: defineTable({
    id: v.optional(v.string()),
    order: v.number(),
    isPublished: v.boolean(),
    pureLink: v.boolean(),
    contentType: v.union(
      v.literal("google_docs"),
      v.literal("notion"),
      v.literal("quizlet"),
      v.literal("tiptap"),
      v.literal("flashcard")
    ),
    courseId: v.id("courses"),
    unitId: v.id("units"),
    name: v.string(),
    content: v.optional(v.any()), // JSONContent type
  })
    .index("by_course_id", ["courseId"])
    .index("by_unit_id", ["unitId"])
    .index("by_unit_and_order", ["unitId", "order"])
    .index("by_is_published", ["isPublished"])
    .index("by_content_type", ["contentType"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["courseId", "unitId", "isPublished", "contentType"],
    }),

  lessonEmbeds: defineTable({
    id: v.optional(v.string()),
    password: v.optional(v.string()),
    lessonId: v.id("lessons"),
    embedUrl: v.string(),
  }).index("by_lesson_id", ["lessonId"]),

  easyNoteCards: defineTable({
    id: v.optional(v.string()),
    front: v.string(),
    embedding: v.optional(v.array(v.number())), // Vector embedding as array of numbers
    options: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    unitId: v.optional(v.id("units")),
    chapter: v.optional(v.number()),
    back: v.string(),
  })
    .index("by_unit_id", ["unitId"])
    .index("by_chapter", ["chapter"])
    .index("by_unit_and_chapter", ["unitId", "chapter"]),

  logs: defineTable({
    userId: v.string(),
    lessonId: v.optional(v.id("lessons")),
    unitId: v.optional(v.id("units")),
    courseId: v.optional(v.id("courses")),
    action: v.union(
      v.literal("CREATE_LESSON"),
      v.literal("UPDATE_LESSON"),
      v.literal("DELETE_LESSON"),
      v.literal("CREATE_COURSE"),
      v.literal("UPDATE_COURSE"),
      v.literal("DELETE_COURSE"),
      v.literal("CREATE_UNIT"),
      v.literal("UPDATE_UNIT"),
      v.literal("DELETE_UNIT"),
      v.literal("REORDER_UNIT"),
      v.literal("REORDER_LESSON"),
      v.literal("DELETE_USER"),
      v.literal("UPDATE_USER")
    ),
    timestamp: v.optional(v.number()), // Will use _creationTime if not provided
  })
    .index("by_user_id", ["userId"])
    .index("by_lesson_id", ["lessonId"])
    .index("by_unit_id", ["unitId"])
    .index("by_course_id", ["courseId"])
    .index("by_action", ["action"])
    .index("by_user_and_action", ["userId", "action"]),
};

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  ...applicationTables,
});
