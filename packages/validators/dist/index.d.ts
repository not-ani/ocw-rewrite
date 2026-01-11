export declare const addCourseFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    name: string;
    description: string;
    subjectId: string;
    isPublic: import("arktype/internal/attributes.ts").Default<boolean, false>;
}, {}>;
export type AddCourseFormValues = typeof addCourseFormSchema.infer;
export declare const addUserToCourseFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    userId: string;
    role: "admin" | "editor" | "user";
}, {}>;
export type AddUserToCourseFormValues = typeof addUserToCourseFormSchema.infer;
export declare const createUnitDialogFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    unitName: string;
    isPublished: boolean;
    description?: string | undefined;
}, {}>;
export type CreateUnitDialogFormValues = typeof createUnitDialogFormSchema.infer;
export declare const createUnitInlineFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    unitName: string;
    description: string;
    isPublished: boolean;
}, {}>;
export type CreateUnitInlineFormValues = typeof createUnitInlineFormSchema.infer;
export declare const createLessonDialogFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    name: string;
    embedRaw?: string | undefined;
    pdfUrl?: string | undefined;
    pdfName?: string | undefined;
    pureLink?: boolean | undefined;
    isPublished?: boolean | undefined;
}, {}>;
export type CreateLessonDialogFormValues = typeof createLessonDialogFormSchema.infer;
export declare const createLessonInlineFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    name: string;
    unitId: string;
    embedRaw?: string | undefined;
    pdfUrl?: string | undefined;
    pdfName?: string | undefined;
    pureLink?: boolean | undefined;
}, {}>;
export type CreateLessonInlineFormValues = typeof createLessonInlineFormSchema.infer;
export declare const unitEditFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    name: string;
    isPublished: boolean;
    description?: string | undefined;
}, {}>;
export type UnitEditFormValues = typeof unitEditFormSchema.infer;
export declare const lessonEditFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    name: string;
    isPublished: boolean;
    contentType: "google_docs" | "notion" | "quizlet" | "google_drive" | "youtube" | "pdf" | "other";
    embedUrl: string;
    pureLink: boolean;
    pdfUrl?: string | undefined;
}, {}>;
export type LessonEditFormValues = typeof lessonEditFormSchema.infer;
export declare const basicInformationFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    schoolName: string;
    siteHero?: string | undefined;
    siteLogo?: string | undefined;
    siteContributeLink?: string | undefined;
    instagramUrl?: string | undefined;
}, {}>;
export type BasicInformationFormValues = typeof basicInformationFormSchema.infer;
export declare const clubInformationFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    clubName: string;
    clubEmail: string;
}, {}>;
export type ClubInformationFormValues = typeof clubInformationFormSchema.infer;
export declare const contactPersonFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    name: string;
    email: string;
    description?: string | undefined;
}, {}>;
export type ContactPersonFormValues = typeof contactPersonFormSchema.infer;
export declare const contributorFormSchema: import("arktype/internal/variants/object.ts").ObjectType<{
    name: string;
    role: string;
    avatar?: string | undefined;
    description?: string | undefined;
}, {}>;
export type ContributorFormValues = typeof contributorFormSchema.infer;
//# sourceMappingURL=index.d.ts.map