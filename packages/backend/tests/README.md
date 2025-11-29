# Backend Tests

This directory contains unit tests for the Convex backend functions using `convex-test`.

## Why tests are outside `convex/`

Tests are intentionally placed **outside** the `convex/` directory to avoid bundling issues. The Convex bundler processes all files inside `convex/` and would fail when encountering Node.js-specific imports (like `crypto` from `convex-test`).

## Running Tests

```bash
# From packages/backend
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

## Structure

```
tests/
├── convexTestHelper.ts   # Creates convex-test instances
├── setup.ts              # Test setup helpers (create courses, users, etc.)
├── testUtils.ts          # Mock data factories and test fixtures
├── admin.test.ts         # Admin function tests
├── courses.test.ts       # Course CRUD tests
├── forking.test.ts       # Course forking tests
├── lessons.test.ts       # Lesson function tests
├── permissions.test.ts   # Permission system tests
└── units.test.ts         # Unit function tests
```

## Writing Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createConvexTest } from "./convexTestHelper";
import { api } from "../convex/_generated/api";
import { TEST_USERS, TEST_SCHOOLS } from "./testUtils";
import { setupSiteAdmin, setupCourse } from "./setup";

describe("My Feature", () => {
  let t: ReturnType<typeof createConvexTest>;

  beforeEach(() => {
    t = createConvexTest();
  });

  afterEach(async () => {
    await t.finishAllScheduledFunctions();
  });

  it("should do something", async () => {
    // Setup test data
    await setupSiteAdmin(t, TEST_SCHOOLS.PRIMARY);
    const { courseId } = await setupCourse(t, TEST_SCHOOLS.PRIMARY);

    // Run function as authenticated user
    const result = await t.withIdentity(TEST_USERS.SITE_ADMIN).query(
      api.courses.getCourse,
      { courseId, school: TEST_SCHOOLS.PRIMARY }
    );

    expect(result).toBeDefined();
  });
});
```

## Test Users

Pre-defined test users in `testUtils.ts`:

- `TEST_USERS.SITE_ADMIN` - Site administrator
- `TEST_USERS.COURSE_ADMIN` - Course administrator  
- `TEST_USERS.COURSE_EDITOR` - Course editor
- `TEST_USERS.REGULAR_USER` - Regular authenticated user
- `TEST_USERS.UNAUTHENTICATED` - No authentication (null)

