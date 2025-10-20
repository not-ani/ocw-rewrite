# Dashboard Command Palette

A powerful, all-in-one command palette for the OCW dashboard. Provides quick search, navigation, and creation capabilities for Units and Lessons.

## Features

### 🔍 Search & Navigation

- **Real-time Search**: Search for Units and Lessons with instant results
- **Debounced Queries**: Efficient search with 300ms debounce to reduce backend load
- **Context-Aware**: Automatically scopes search to the current course
- **Smart Navigation**: Click any result to instantly navigate to that Unit or Lesson

### ✨ Quick Actions

- **Create Unit**: Inline form with validation for creating new units
- **Create Lesson**: Inline form with Unit selection via Combobox
- **Keyboard Shortcuts**: Open with `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)

### 🎨 User Experience

- **Loading States**: Elegant loading skeletons while fetching data
- **Empty States**: Helpful messages when no results are found
- **Error Handling**: Toast notifications for success/error states
- **Responsive Design**: Works seamlessly on all screen sizes

## Architecture

### Component Structure

```
dashboard-command.tsx          # Main command palette component
├── command/
│   ├── create-unit-form.tsx  # Inline Unit creation form
│   ├── create-lesson-form.tsx # Inline Lesson creation form
│   └── README.md             # This file
```

### Backend Queries

**Units:**

- `api.units.searchByCourse` - Search units within a course
- `api.units.getTableData` - Get all units for Combobox dropdown
- `api.units.create` - Create new unit

**Lessons:**

- `api.lesson.searchByCourse` - Search lessons within a course
- `api.lesson.create` - Create new lesson

## Usage

### Basic Usage

The command palette is automatically available in the dashboard header. Users can:

1. Click the search button in the header
2. Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)
3. Type to search or select a quick action

### Search Mode

```typescript
// Type any text to search
"intro" → Shows matching Units and Lessons

// Results are grouped by type
Units:
  - Introduction to Programming
  - Introduction to Data Structures

Lessons:
  - Variables and Data Types (in Introduction to Programming)
  - Arrays Introduction (in Introduction to Data Structures)
```

### Create Mode

```typescript
// Select "Create New Unit" from quick actions
→ Shows inline form with:
  - Unit Name (required)
  - Description (optional)
  - Published checkbox

// Select "Create New Lesson" from quick actions
→ Shows inline form with:
  - Lesson Name (required)
  - Unit Selection (required, via Combobox)
  - Embed URL/iFrame (optional)
```

## TypeScript Types

### Command Mode

```typescript
type CommandMode = "search" | "create-unit" | "create-lesson";
```

### Form Schemas

**Unit Form:**

```typescript
{
  unitName: string (min: 3, max: 50)
  description?: string
  isPublished: boolean (default: false)
}
```

**Lesson Form:**

```typescript
{
  name: string (min: 3, max: 200)
  unitId: string (required)
  embedRaw?: string
}
```

## Performance Optimizations

1. **Debouncing**: 300ms debounce on search input to reduce API calls
2. **Conditional Queries**: Search queries only fire when in search mode and input is not empty
3. **Skip Pattern**: Uses Convex's `"skip"` pattern to prevent unnecessary queries
4. **Memoization**: CourseId extraction is memoized to prevent recalculation

## Keyboard Shortcuts

| Shortcut        | Action                |
| --------------- | --------------------- |
| `⌘K` / `Ctrl+K` | Open command palette  |
| `Esc`           | Close command palette |
| `↑` / `↓`       | Navigate results      |
| `Enter`         | Select result/action  |

## Extending the Command Palette

### Adding New Commands

1. Update the `CommandMode` type:

```typescript
type CommandMode = "search" | "create-unit" | "create-lesson" | "your-new-mode";
```

2. Add a new quick action:

```typescript
<CommandItem onSelect={() => setMode("your-new-mode")}>
  <YourIcon size={16} />
  <span>Your Action</span>
</CommandItem>
```

3. Add the corresponding UI in the dialog:

```typescript
{mode === "your-new-mode" && (
  <YourComponent onSuccess={handleSuccess} onCancel={() => setMode("search")} />
)}
```

### Adding New Search Categories

To add search for another entity type (e.g., "Resources"):

1. Create a backend search query in Convex
2. Add the query to the component:

```typescript
const resources = useQuery(
  api.resources.searchByCourse,
  courseId && debouncedSearch.trim() && mode === "search"
    ? { courseId, searchTerm: debouncedSearch }
    : "skip",
);
```

3. Display results in a new group:

```typescript
{resources && resources.length > 0 && (
  <CommandGroup heading="Resources">
    {resources.map((resource) => (...))}
  </CommandGroup>
)}
```

## Best Practices

1. **Always validate forms** before submission
2. **Show loading states** during async operations
3. **Use toast notifications** for user feedback
4. **Handle errors gracefully** with try/catch blocks
5. **Keep forms simple** with clear labels and descriptions
6. **Use proper TypeScript types** for all props and state

## Troubleshooting

### Command palette doesn't open

- Verify you're on a dashboard page (`/course/[id]/dashboard/*`)
- Check browser console for JavaScript errors
- Ensure courseId is being extracted correctly from pathname

### Search not working

- Verify backend queries are deployed
- Check Convex dashboard for query errors
- Ensure search indexes are set up in schema

### Combobox not loading units

- Verify `api.units.getTableData` query exists
- Check that courseId is being passed correctly
- Look for network errors in browser dev tools

## Future Enhancements

- [ ] Add keyboard navigation for search results
- [ ] Support for deleting Units/Lessons from command palette
- [ ] Recent items/history tracking
- [ ] Fuzzy search with better matching algorithms
- [ ] Support for editing Units/Lessons inline
- [ ] Global search across all courses (for admins)
- [ ] Command palette themes/customization
