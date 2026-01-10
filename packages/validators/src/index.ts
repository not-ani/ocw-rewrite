import { z } from "zod";

// Admin - Courses
export const addCourseFormSchema = z.object({
	name: z
		.string()
		.min(3, "Course name must be at least 3 characters")
		.max(100, "Course name must be less than 100 characters"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description must be less than 500 characters"),
	subjectId: z.string().min(1, "Subject ID is required"),
	isPublic: z.boolean().default(false),
});

export type AddCourseFormValues = z.infer<typeof addCourseFormSchema>;

// Dashboard - Users
export const addUserToCourseFormSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	role: z.enum(["admin", "editor", "user"]),
});

export type AddUserToCourseFormValues = z.infer<
	typeof addUserToCourseFormSchema
>;

// Dashboard - Units
export const createUnitDialogFormSchema = z.object({
	unitName: z.string().min(1).min(3).max(50),
	description: z.string().optional(),
	isPublished: z.boolean().default(true).optional(),
});

export type CreateUnitDialogFormValues = z.infer<
	typeof createUnitDialogFormSchema
>;

export const createUnitInlineFormSchema = z.object({
	unitName: z
		.string()
		.min(3, "Unit name must be at least 3 characters")
		.max(50),
	description: z.string().optional(),
	isPublished: z.boolean().default(false).optional(),
});

export type CreateUnitInlineFormValues = z.infer<
	typeof createUnitInlineFormSchema
>;

// Dashboard - Lessons
export const createLessonDialogFormSchema = z.object({
	name: z.string().min(1, "Lesson name is required").min(3).max(200),
	embedRaw: z.string().optional(),
	pdfUrl: z.string().optional(),
	pdfName: z.string().optional(),
	pureLink: z.boolean().optional(),
	// Present in UI but not currently used in submit payload
	isPublished: z.boolean().optional(),
});

export type CreateLessonDialogFormValues = z.infer<
	typeof createLessonDialogFormSchema
>;

export const createLessonInlineFormSchema = z.object({
	name: z.string().min(3, "Lesson name must be at least 3 characters").max(200),
	unitId: z.string().min(1, "Please select a unit"),
	embedRaw: z.string().optional(),
	pdfUrl: z.string().optional(),
	pdfName: z.string().optional(),
	pureLink: z.boolean().optional(),
});

export type CreateLessonInlineFormValues = z.infer<
	typeof createLessonInlineFormSchema
>;

// Course dashboard - Unit edit
export const unitEditFormSchema = z.object({
	name: z.string().min(1, "Unit name is required").max(200),
	description: z.string().max(1000).optional(),
	isPublished: z.boolean(),
});

export type UnitEditFormValues = z.infer<typeof unitEditFormSchema>;

// Course dashboard - Lesson edit
export const lessonEditFormSchema = z.object({
	name: z.string().min(1, "Lesson name is required").max(200),
	isPublished: z.boolean(),
	contentType: z.enum([
		"google_docs",
		"notion",
		"quizlet",
		"google_drive",
		"youtube",
		"pdf",
		"other",
	]),
	embedUrl: z.string(),
	pdfUrl: z.string().optional(),
	pureLink: z.boolean(),
});

export type LessonEditFormValues = z.infer<typeof lessonEditFormSchema>;

// Admin - Site Content
export const basicInformationFormSchema = z.object({
	schoolName: z.string().min(1, "School name is required"),
	siteHero: z.string().optional(),
	siteLogo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
	siteContributeLink: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	instagramUrl: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
});

export type BasicInformationFormValues = z.infer<
	typeof basicInformationFormSchema
>;

export const clubInformationFormSchema = z.object({
	clubName: z.string().min(1, "Club name is required"),
	clubEmail: z.email("Must be a valid email address"),
});

export type ClubInformationFormValues = z.infer<
	typeof clubInformationFormSchema
>;

export const contactPersonFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Must be a valid email address"),
	description: z.string().optional(),
});

export type ContactPersonFormValues = z.infer<typeof contactPersonFormSchema>;

export const contributorFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	role: z.string().min(1, "Role is required"),
	avatar: z.url("Must be a valid URL").optional().or(z.literal("")),
	description: z.string().optional(),
});

export type ContributorFormValues = z.infer<typeof contributorFormSchema>;

