# Permission Wrappers

Generic client-side permission wrappers for protecting UI elements based on user roles and permissions.

## Components

### `PermissionWrapper`

A client component that conditionally renders children based on user's role and permissions for a course.

#### Usage

```tsx
import { PermissionWrapper } from "@/components/permissions";

// Require admin role
<PermissionWrapper 
  courseId={courseId} 
  requiredRole="admin"
  fallback={<p>Admin access required</p>}
>
  <AdminOnlyContent />
</PermissionWrapper>

// Require specific permission
<PermissionWrapper 
  courseId={courseId} 
  requiredPermission="manage_users"
>
  <ManageUsersButton />
</PermissionWrapper>

// Require editor or higher
<PermissionWrapper 
  courseId={courseId} 
  requiredRole="editor"
>
  <EditButton />
</PermissionWrapper>
```

#### Props

- `courseId` (required): The course ID to check permissions for
- `requiredRole`: Minimum role required ("admin" | "editor" | "user")
- `requiredPermission`: Specific permission required
- `fallback`: Component to show when permission is denied
- `children`: Content to show when permission is granted

### `usePermission` Hook

A hook for programmatic permission checks in client components.

#### Usage

```tsx
import { usePermission } from "@/components/permissions";

function MyComponent({ courseId }) {
  const { 
    membership,
    hasRole, 
    hasPermission, 
    canManageUsers,
    isAdmin,
    isEditor,
    isAdminOrEditor
  } = usePermission(courseId);

  // Check role
  if (hasRole("admin")) {
    // Admin only logic
  }

  // Check permission
  if (hasPermission("manage_users")) {
    // User management logic
  }

  // Convenience methods
  if (canManageUsers()) {
    // ...
  }

  return <div>...</div>;
}
```

## Server-Side Permission Utilities

Located in `@/lib/permissions.ts`

### `checkUserManagementPermission(courseId)`

Server-only function to check if user can manage users for a course.

```tsx
import { checkUserManagementPermission } from "@/lib/permissions";

export default async function Page({ params }) {
  const { authorized, membership } = await checkUserManagementPermission(
    params.id as Id<"courses">
  );

  if (!authorized) {
    redirect("/unauthorized");
  }

  // ...
}
```

### `checkAdminOrEditorPermission(courseId)`

Server-only function to check if user is admin or editor.

### `getAllClerkUsers()`

Fetches all users from Clerk for the organization.

### `getClerkUser(userId)`

Fetches a specific user from Clerk by ID.

## Role Hierarchy

Roles follow a hierarchy where higher roles inherit permissions of lower roles:

- **Admin** (3): Full access to everything
- **Editor** (2): Can create and edit content, has most permissions by default
- **User** (1): View-only access to published content

When checking `requiredRole`, users with higher roles will also pass the check.

## Available Permissions

- `create_unit`
- `edit_unit`
- `delete_unit`
- `create_lesson`
- `edit_lesson`
- `delete_lesson`
- `reorder_lesson`
- `manage_users`
- `manage_course`

Note: Admin and Editor roles automatically have all permissions.

