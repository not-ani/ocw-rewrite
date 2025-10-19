// NOTE: all instances of id are deprecated and will be removed in a future migration, all fields that point to and id already refer the the _id that Convex generates
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  siteConfig: defineTable({
    school: v.string(),
    siteHero: v.optional(v.string()),
    schoolName: v.string(),
    siteLogo: v.optional(v.string()),
    contributors: v.optional(v.array(
      v.object({
        name: v.string(),
        role: v.string(),
        avatar: v.string(),
        description: v.string(),
      })
    )),
    siteContributeLink: v.optional(v.string()),
    club: v.optional(
      v.object({
        name: v.string(),
        email: v.string(),
      })
    ),
    personsContact: v.optional(v.array(
      v.object({
        name: v.string(),
        email: v.string(),
        description: v.string(),
      })
    )),
  }).index("by_school", ["school"]),
  siteUser: defineTable({
    userId: v.string(),
    role: v.union(v.literal("admin")),
    school: v.string(),
  })
    .index("by_user_id_and_school", ["userId", "school"])
    .index("by_user_id", ["userId"])
    .index("by_school", ["school"]),
  courses: defineTable({
    subjectId: v.string(),
    id: v.optional(v.string()),
    name: v.string(),
    aliases: v.array(v.string()),
    isPublic: v.boolean(),
    imageUrl: v.optional(v.string()),
    unitLength: v.number(),
    school: v.string(),
    description: v.string(),
  })
    .index("by_is_public_and_school", ["isPublic", "school"])
    .index("by_subject_id_and_school", ["subjectId", "school"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["isPublic", "subjectId", "school"],
    })
    .searchIndex("search_description", {
      searchField: "description",
      filterFields: ["isPublic", "subjectId", "school"],
    }),

  courseUsers: defineTable({
    school: v.string(),
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
    .index("by_user_id_and_school", ["userId", "school"])
    .index("by_course_and_user_and_school", ["courseId", "userId", "school"])
    .index("by_role_and_school", ["role", "school"]),

  units: defineTable({
    school: v.string(),
    id: v.optional(v.string()),
    courseId: v.id("courses"),
    name: v.string(),
    description: v.optional(v.string()),
    isPublished: v.boolean(),
    order: v.number(),
  })
    .index("by_course_id", ["courseId"])
    .index("by_course_id_and_school", ["courseId", "school"])
    .index("by_course_and_order_and_school", ["courseId", "school", "order"])
    .index("by_is_published_and_school", ["isPublished", "school"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["courseId", "isPublished", "school"],
    })
    .searchIndex("search_description", {
      searchField: "description",
      filterFields: ["courseId", "isPublished", "school"],
    }),

  lessons: defineTable({
    school: v.string(),
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
    .index("by_is_published_and_school", ["isPublished", "school"])
    .index("by_content_type_and_school", ["contentType", "school"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: [
        "courseId",
        "unitId",
        "isPublished",
        "contentType",
        "school",
      ],
    }),

  lessonEmbeds: defineTable({
    school: v.string(),
    id: v.optional(v.string()),
    password: v.optional(v.string()),
    lessonId: v.id("lessons"),
    embedUrl: v.string(),
  }).index("by_lesson_id", ["lessonId"]),

  logs: defineTable({
    school: v.string(),
    userId: v.string(),
    id: v.optional(v.string()),
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
    .index("by_user_id_and_school", ["userId", "school"])
    .index("by_lesson_id_and_school", ["lessonId", "school"])
    .index("by_unit_id_and_school", ["unitId", "school"])
    .index("by_course_id_and_school", ["courseId", "school"])
    .index("by_action_and_school", ["action", "school"])
    .index("by_user_and_action_and_school", ["userId", "action", "school"]),
});
