/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as convertIds from "../convertIds.js";
import type * as courseUsers from "../courseUsers.js";
import type * as courses from "../courses.js";
import type * as healthCheck from "../healthCheck.js";
import type * as lesson from "../lesson.js";
import type * as permissions from "../permissions.js";
import type * as privateData from "../privateData.js";
import type * as todos from "../todos.js";
import type * as units from "../units.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  convertIds: typeof convertIds;
  courseUsers: typeof courseUsers;
  courses: typeof courses;
  healthCheck: typeof healthCheck;
  lesson: typeof lesson;
  permissions: typeof permissions;
  privateData: typeof privateData;
  todos: typeof todos;
  units: typeof units;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
