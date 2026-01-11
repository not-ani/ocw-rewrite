import { type } from "arktype";

export const addCourseFormSchema = type({
  name: "3 <= string <= 100",
  description: "10 <= string <= 500",
  subjectId: "string",
  isPublic: "boolean = false",
});

export type AddCourseFormValues = typeof addCourseFormSchema.infer;

export const addUserToCourseFormSchema = type({
  userId: "string",
  role: "'admin' | 'editor' | 'user'",
});

export type AddUserToCourseFormValues = typeof addUserToCourseFormSchema.infer;

export const createUnitDialogFormSchema = type({
  unitName: "3 <= string <= 50",
  description: "string?",
  isPublished: "boolean",
});

export type CreateUnitDialogFormValues =
  typeof createUnitDialogFormSchema.infer;

export const createUnitInlineFormSchema = type({
  unitName: "3 <= string <= 50",
  description: "string",
  isPublished: "boolean",
});

export type CreateUnitInlineFormValues =
  typeof createUnitInlineFormSchema.infer;

export const createLessonDialogFormSchema = type({
  name: "3 <= string <= 200",
  embedRaw: "string?",
  pdfUrl: "string?",
  pdfName: "string?",
  pureLink: "boolean?",
  isPublished: "boolean?",
});

export type CreateLessonDialogFormValues =
  typeof createLessonDialogFormSchema.infer;

export const createLessonInlineFormSchema = type({
  name: "3 <= string <= 200",
  unitId: "string",
  embedRaw: "string?",
  pdfUrl: "string?",
  pdfName: "string?",
  pureLink: "boolean?",
});

export type CreateLessonInlineFormValues =
  typeof createLessonInlineFormSchema.infer;

export const unitEditFormSchema = type({
  name: "1 <= string <= 200",
  description: "string?",
  isPublished: "boolean",
});

export type UnitEditFormValues = typeof unitEditFormSchema.infer;

export const lessonEditFormSchema = type({
  name: "1 <= string <= 200",
  isPublished: "boolean",
  contentType:
    "'google_docs' | 'notion' | 'quizlet' | 'google_drive' | 'youtube' | 'pdf' | 'other'",
  embedUrl: "string",
  pdfUrl: "string?",
  pureLink: "boolean",
});

export type LessonEditFormValues = typeof lessonEditFormSchema.infer;

export const basicInformationFormSchema = type({
  schoolName: "string",
  siteHero: "string?",
  siteLogo: "string.url?",
  siteContributeLink: "string.url?",
  instagramUrl: "string.url?",
});

export type BasicInformationFormValues =
  typeof basicInformationFormSchema.infer;

export const clubInformationFormSchema = type({
  clubName: "string",
  clubEmail: "string.email",
});

export type ClubInformationFormValues = typeof clubInformationFormSchema.infer;

export const contactPersonFormSchema = type({
  name: "string",
  email: "string.email",
  description: "string?",
});

export type ContactPersonFormValues = typeof contactPersonFormSchema.infer;

export const contributorFormSchema = type({
  name: "string",
  role: "string",
  avatar: "string.url?",
  description: "string?",
});

export type ContributorFormValues = typeof contributorFormSchema.infer;
