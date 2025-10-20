/**
 * PERMISSION WRAPPER EXAMPLES
 *
 * This file contains practical examples of how to use the permission
 * wrappers throughout your application. Copy these patterns as needed.
 */

import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { PermissionWrapper, usePermission } from "./permission-wrapper";
import { Button } from "@/components/ui/button";

// ============================================================================
// EXAMPLE 1: Wrapper Component - Hide UI for unauthorized users
// ============================================================================

export function DeleteUnitButton({
  courseId,
  unitId,
}: {
  courseId: Id<"courses">;
  unitId: Id<"units">;
}) {
  return (
    <PermissionWrapper courseId={courseId} requiredPermission="delete_unit">
      <Button variant="destructive">Delete Unit</Button>
    </PermissionWrapper>
  );
}

// ============================================================================
// EXAMPLE 2: Wrapper with Fallback - Show different UI
// ============================================================================

export function EditButton({ courseId }: { courseId: Id<"courses"> }) {
  return (
    <PermissionWrapper
      courseId={courseId}
      requiredRole="editor"
      fallback={<Button disabled>View Only</Button>}
    >
      <Button>Edit</Button>
    </PermissionWrapper>
  );
}

// ============================================================================
// EXAMPLE 3: Multiple Permission Checks - Separate wrappers
// ============================================================================

export function CourseActions({ courseId }: { courseId: Id<"courses"> }) {
  return (
    <div className="flex gap-2">
      <PermissionWrapper courseId={courseId} requiredPermission="create_unit">
        <Button>Create Unit</Button>
      </PermissionWrapper>

      <PermissionWrapper courseId={courseId} requiredPermission="manage_users">
        <Button>Manage Users</Button>
      </PermissionWrapper>

      <PermissionWrapper courseId={courseId} requiredRole="admin">
        <Button variant="destructive">Delete Course</Button>
      </PermissionWrapper>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Hook Usage - Programmatic checks
// ============================================================================

export function DashboardHeader({ courseId }: { courseId: Id<"courses"> }) {
  const {
    hasPermission,
    isAdmin,
    isAdminOrEditor,
    canManageUsers,
    membership,
  } = usePermission(courseId);

  // Don't show anything while loading
  if (!membership) {
    return null;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Conditional rendering based on role */}
      {isAdmin() && (
        <p className="text-muted-foreground text-sm">You have admin access</p>
      )}

      {/* Conditional rendering based on permission */}
      {hasPermission("manage_course") && <Button>Course Settings</Button>}

      {/* Multiple conditions */}
      {(isAdminOrEditor() || hasPermission("create_lesson")) && (
        <Button>Create Content</Button>
      )}

      {/* Convenience method */}
      {canManageUsers() && <Button>Manage Users</Button>}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Hook with Business Logic
// ============================================================================

export function LessonEditor({
  courseId,
  lessonId,
}: {
  courseId: Id<"courses">;
  lessonId: Id<"lessons">;
}) {
  const { hasPermission, isAdmin } = usePermission(courseId);

  const handleSave = async () => {
    // Check permission before action
    if (!hasPermission("edit_lesson")) {
      console.error("No permission to edit");
      return;
    }

    // Save logic here
  };

  const handleDelete = async () => {
    // Only admins can delete
    if (!isAdmin()) {
      console.error("Only admins can delete");
      return;
    }

    // Delete logic here
  };

  return (
    <div>
      <Button onClick={handleSave}>Save</Button>
      {isAdmin() && (
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Complex Nested Permissions
// ============================================================================

export function AdminPanel({ courseId }: { courseId: Id<"courses"> }) {
  return (
    <PermissionWrapper
      courseId={courseId}
      requiredRole="admin"
      fallback={
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      }
    >
      <div className="space-y-4">
        <h2>Admin Panel</h2>

        {/* Even within admin panel, can check specific permissions */}
        <PermissionWrapper
          courseId={courseId}
          requiredPermission="manage_course"
        >
          <Button>Course Settings</Button>
        </PermissionWrapper>

        <PermissionWrapper
          courseId={courseId}
          requiredPermission="manage_users"
        >
          <Button>User Management</Button>
        </PermissionWrapper>
      </div>
    </PermissionWrapper>
  );
}

// ============================================================================
// EXAMPLE 7: Combining Hook with State
// ============================================================================

export function AdvancedEditor({ courseId }: { courseId: Id<"courses"> }) {
  const { membership, hasPermission } = usePermission(courseId);

  // Use membership data for display
  const userRole = membership?.role;

  // Derived state based on permissions
  const canEdit = hasPermission("edit_lesson");
  const canDelete = hasPermission("delete_lesson");
  const canPublish = hasPermission("edit_lesson");

  return (
    <div>
      <div className="flex items-center justify-between">
        <span>Role: {userRole}</span>

        <div className="flex gap-2">
          {canEdit && <Button>Edit</Button>}
          {canPublish && <Button>Publish</Button>}
          {canDelete && <Button variant="destructive">Delete</Button>}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Form with Permission Checks
// ============================================================================

export function UnitForm({ courseId }: { courseId: Id<"courses"> }) {
  const { hasPermission } = usePermission(courseId);

  const canCreate = hasPermission("create_unit");
  const canEdit = hasPermission("edit_unit");

  if (!canCreate && !canEdit) {
    return <p>You don't have permission to manage units</p>;
  }

  return (
    <form>
      {/* Form fields */}
      <input type="text" placeholder="Unit name" />

      {canCreate && <Button type="submit">Create Unit</Button>}
      {canEdit && <Button type="submit">Update Unit</Button>}
    </form>
  );
}

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * 1. Use <PermissionWrapper> for declarative UI hiding
 *    - Simple show/hide based on role or permission
 *    - Great for buttons, menu items, sections
 *
 * 2. Use usePermission() hook for:
 *    - Complex conditional logic
 *    - Multiple permission checks
 *    - Business logic that needs permission data
 *    - Accessing membership data
 *
 * 3. Always handle loading state (when membership is undefined)
 *
 * 4. Remember: Admin and Editor roles have ALL permissions by default
 *
 * 5. For server-side protection, use functions from @/lib/permissions:
 *    - checkUserManagementPermission()
 *    - checkAdminOrEditorPermission()
 *
 * 6. Client-side checks are for UX only - always validate on server!
 */
