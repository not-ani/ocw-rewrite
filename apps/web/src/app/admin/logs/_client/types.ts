import type { Id } from "@ocw/backend/convex/_generated/dataModel";

export type ClerkUser = {
	id: string;
	clerkId: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	imageUrl: string;
};

export type LogAction =
	| "CREATE_LESSON"
	| "UPDATE_LESSON"
	| "DELETE_LESSON"
	| "CREATE_COURSE"
	| "UPDATE_COURSE"
	| "DELETE_COURSE"
	| "CREATE_UNIT"
	| "UPDATE_UNIT"
	| "DELETE_UNIT"
	| "REORDER_UNIT"
	| "REORDER_LESSON"
	| "DELETE_USER"
	| "UPDATE_USER";

export type EnrichedLog = {
	_id: Id<"logs">;
	_creationTime: number;
	school: string;
	userId: string;
	lessonId?: Id<"lessons">;
	unitId?: Id<"units">;
	courseId?: Id<"courses">;
	action: LogAction;
	timestamp?: number;
	courseName?: string;
	unitName?: string;
	lessonName?: string;
};

export type LogFilters = {
	action: LogAction | "all";
	userId: string | "all";
	courseId: Id<"courses"> | "all";
	startDate: Date | undefined;
	endDate: Date | undefined;
};

export const LOG_ACTION_LABELS: Record<LogAction, string> = {
	CREATE_LESSON: "Create Lesson",
	UPDATE_LESSON: "Update Lesson",
	DELETE_LESSON: "Delete Lesson",
	CREATE_COURSE: "Create Course",
	UPDATE_COURSE: "Update Course",
	DELETE_COURSE: "Delete Course",
	CREATE_UNIT: "Create Unit",
	UPDATE_UNIT: "Update Unit",
	DELETE_UNIT: "Delete Unit",
	REORDER_UNIT: "Reorder Unit",
	REORDER_LESSON: "Reorder Lesson",
	DELETE_USER: "Delete User",
	UPDATE_USER: "Update User",
};

export const LOG_ACTION_CATEGORIES: Record<string, LogAction[]> = {
	Lessons: [
		"CREATE_LESSON",
		"UPDATE_LESSON",
		"DELETE_LESSON",
		"REORDER_LESSON",
	],
	Units: ["CREATE_UNIT", "UPDATE_UNIT", "DELETE_UNIT", "REORDER_UNIT"],
	Courses: ["CREATE_COURSE", "UPDATE_COURSE", "DELETE_COURSE"],
	Users: ["DELETE_USER", "UPDATE_USER"],
};
