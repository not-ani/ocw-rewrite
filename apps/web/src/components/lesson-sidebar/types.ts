import type { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type SidebarData = FunctionReturnType<typeof api.courses.getSidebarData>;
