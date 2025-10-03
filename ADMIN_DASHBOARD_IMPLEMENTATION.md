# Site-Wide Admin Dashboard Implementation

## Overview
A complete site-wide admin dashboard has been implemented with full CRUD operations for courses and site administrator management. The dashboard follows best practices with granular loading states, permission checks, and server-side prefetching.

## Features Implemented

### 1. Course Management
- **View all courses** in a sortable table using kibo-ui components
- **Publish/Unpublish courses** with confirmation dialogs
- **Click-through navigation** to course dashboards (`/course/[id]/dashboard`)
- **Course details** display including:
  - Course name and description
  - Subject badge
  - Unit count
  - Publication status
  - Action menu

### 2. Site Admin Management
- **View all site administrators** in a dedicated table
- **Add new site admins** through a searchable user selection dialog
- **Remove site admins** with confirmation (prevents self-removal)
- **User information display** with avatars and email addresses

### 3. Security & Permissions
- **Server-side authorization** checks before rendering
- **Convex backend validation** for all admin operations
- **Protected API routes** for Clerk user data
- **Redirects** for unauthorized access attempts
- **Role-based access control** (site admin only)

### 4. User Experience
- **Granular loading states** using shadcn skeleton components
- **Server-side prefetching** for optimal performance
- **Responsive design** for mobile and desktop
- **Toast notifications** for action feedback
- **Confirmation dialogs** for destructive actions
- **Admin link in header** (visible only to site admins)

## File Structure

### Backend (Convex)
```
packages/backend/convex/
└── admin.ts                 # All admin-related queries and mutations
```

**Functions:**
- `getAllCourses` - Query all courses (admin only)
- `updateCourseStatus` - Mutation to publish/unpublish courses
- `getAllSiteAdmins` - Query all site administrators
- `addSiteAdmin` - Mutation to add a site admin
- `removeSiteAdmin` - Mutation to remove a site admin (prevents self-removal)
- `isSiteAdmin` - Query to check if current user is a site admin

### Frontend

#### Routes
```
apps/web/src/app/
├── admin/
│   ├── page.tsx            # Server component with auth & prefetching
│   ├── client.tsx          # Client component with state management
│   └── loading.tsx         # Loading state with skeletons
└── api/
    └── clerk-users/
        └── route.ts        # API route to fetch Clerk users
```

#### Components
```
apps/web/src/components/admin/
├── courses-table.tsx       # Courses table with kibo-ui
├── admins-table.tsx        # Site admins table with kibo-ui
└── add-admin-dialog.tsx    # Dialog to add new site admins
```

## Permission Flow

1. **Client Request** → `/admin`
2. **Server Check** → `getAuthToken()` validates authentication
3. **Authorization** → `fetchQuery(api.admin.isSiteAdmin)` checks role
4. **Redirect** → Unauthorized users redirected to home
5. **Data Prefetch** → Courses and admins preloaded on server
6. **Render** → Client component receives preloaded data

## Loading States

### Page Load
- Header skeleton with title and description placeholders
- Courses table skeleton (5 rows with realistic structure)
- Admins table skeleton (3 rows with avatar placeholders)

### Action States
- Button loading states ("Processing...", "Adding...", "Removing...")
- Disabled states during mutations
- Optimistic UI updates where appropriate

## Database Schema

### siteUser Table (existing)
```typescript
{
  userId: string,           // Clerk user ID
  role: "admin",           // Only admin role supported
  _id: Id<"siteUser">,
  _creationTime: number
}
```

**Indexes:**
- `by_user_id` on `userId`

## API Endpoints

### GET `/api/clerk-users`
- **Authentication:** Required (Clerk token)
- **Authorization:** Site admin only
- **Returns:** Array of Clerk users with formatted data
- **Used by:** Add Admin Dialog for user selection

## Key Technologies

- **Convex** - Backend database and real-time queries
- **Clerk** - Authentication and user management
- **Next.js 14+** - App router with server components
- **TanStack Table** - Table functionality (via kibo-ui)
- **Shadcn UI** - UI components
- **Tailwind CSS** - Styling
- **Sonner** - Toast notifications

## Usage

### Accessing the Dashboard
1. Sign in as a user with site admin privileges
2. Click the "Admin" button (shield icon) in the header
3. Navigate to `/admin`

### Managing Courses
- View all courses in the table
- Click "View Dashboard" or row to navigate to course dashboard
- Use the action menu to publish/unpublish courses
- Confirmation required for unpublishing

### Managing Site Admins
- Click "Add Admin" to open the user selection dialog
- Search and select from available Clerk users
- Click "Remove admin" to revoke site admin privileges
- Cannot remove yourself as admin

## Best Practices Followed

1. **Server-Side Rendering**
   - Authorization checks on server
   - Data prefetching with `preloadQuery`
   - Proper use of server/client components

2. **Type Safety**
   - Convex validators for all functions
   - TypeScript types throughout
   - Proper type inference with Preloaded types

3. **Error Handling**
   - Try-catch blocks for all mutations
   - User-friendly error messages
   - Fallback UI states

4. **Performance**
   - Minimal client-side data fetching
   - Optimized re-renders with useMemo
   - Efficient table components

5. **User Experience**
   - Loading skeletons match final UI
   - Clear action feedback
   - Accessible components
   - Responsive design

## Security Considerations

- All admin functions validate site admin role on the backend
- API routes check authentication and authorization
- Sensitive operations require confirmation
- Self-removal prevention for admins
- Server-side redirects for unauthorized access

## Future Enhancements

Potential improvements:
- Bulk course operations
- Advanced filtering and search
- Course analytics dashboard
- Audit log for admin actions
- Email notifications for admin changes
- Role hierarchy (super admin, admin, moderator)

