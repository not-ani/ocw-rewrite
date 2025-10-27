"use client";

import { api } from "@ocw/backend/convex/_generated/api";
import type { Id } from "@ocw/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import type { ReactNode } from "react";

type PermissionWrapperProps = {
	courseId: Id<"courses">;
	requiredRole?: "admin" | "editor" | "user";
	requiredPermission?:
		| "create_unit"
		| "edit_unit"
		| "delete_unit"
		| "create_lesson"
		| "edit_lesson"
		| "delete_lesson"
		| "reorder_lesson"
		| "manage_users"
		| "manage_course";
	fallback?: ReactNode;
	children: ReactNode;
	school: string;
};

/**
 * Client-side permission wrapper that conditionally renders children
 * based on user's role and permissions for a course
 */
export function PermissionWrapper({
	courseId,
	school,
	requiredRole,
	requiredPermission,
	fallback = null,
	children,
}: PermissionWrapperProps) {
	const membership = useQuery(api.courseUsers.getMyMembership, {
		courseId,
		school,
	});
	if (membership === undefined) {
		return null;
	}
	if (!membership) {
		return <>{fallback}</>;
	}

	if (requiredRole) {
		const roleHierarchy = { admin: 3, editor: 2, user: 1 };
		const userRoleLevel = roleHierarchy[membership.role];
		const requiredRoleLevel = roleHierarchy[requiredRole];

		if (userRoleLevel < requiredRoleLevel) {
			return <>{fallback}</>;
		}
	}

	if (requiredPermission) {
		const hasPermission =
			membership.role === "admin" ||
			membership.role === "editor" ||
			membership.permissions.includes(requiredPermission);

		if (!hasPermission) {
			return <>{fallback}</>;
		}
	}

	return <>{children}</>;
}

/**
 * Hook to check if user has permission for a course
 */
export function usePermission(courseId: Id<"courses">, school: string) {
	const membership = useQuery(api.courseUsers.getMyMembership, {
		courseId,
		school,
	});

	const hasRole = (role: "admin" | "editor" | "user") => {
		if (!membership) return false;
		const roleHierarchy = { admin: 3, editor: 2, user: 1 };
		return roleHierarchy[membership.role] >= roleHierarchy[role];
	};

	const hasPermission = (
		permission:
			| "create_unit"
			| "edit_unit"
			| "delete_unit"
			| "create_lesson"
			| "edit_lesson"
			| "delete_lesson"
			| "reorder_lesson"
			| "manage_users"
			| "manage_course",
	) => {
		if (!membership) return false;
		return (
			membership.role === "admin" ||
			membership.role === "editor" ||
			membership.permissions.includes(permission)
		);
	};

	const canManageUsers = () => hasPermission("manage_users");
	const isAdmin = () => membership?.role === "admin";
	const isEditor = () => membership?.role === "editor";
	const isAdminOrEditor = () => isAdmin() || isEditor();

	return {
		membership,
		hasRole,
		hasPermission,
		canManageUsers,
		isAdmin,
		isEditor,
		isAdminOrEditor,
	};
}
