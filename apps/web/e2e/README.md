# E2E Testing with Playwright, Clerk, and Convex

This directory contains end-to-end tests for the OpenCourseWare web application.

## Stack

- **[Playwright](https://playwright.dev/)** - E2E testing framework
- **[@clerk/testing](https://clerk.com/docs/testing/playwright)** - Clerk authentication testing utilities
- **[Convex](https://docs.convex.dev/)** - Backend testing integration

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Install Playwright Browsers

```bash
pnpm test:e2e:install
```

### 3. Configure Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Clerk configuration (required for auth tests)
CLERK_SECRET_KEY=your_clerk_secret_key

# Test user credentials - create these in your Clerk dev dashboard
E2E_ADMIN_EMAIL=e2e-admin@test.com
E2E_ADMIN_PASSWORD=TestPassword123!
E2E_EDITOR_EMAIL=e2e-editor@test.com
E2E_EDITOR_PASSWORD=TestPassword123!
E2E_USER_EMAIL=e2e-user@test.com
E2E_USER_PASSWORD=TestPassword123!

# Base URL (default: http://localhost:3001)
E2E_BASE_URL=http://localhost:3001

# Test school subdomain
E2E_TEST_SCHOOL=test-school
```

### 4. Create Test Users in Clerk

1. Go to your Clerk Dashboard (development instance)
2. Create the following test users:
   - `e2e-admin@test.com` - Site administrator
   - `e2e-editor@test.com` - Course editor
   - `e2e-user@test.com` - Regular user

### 5. Seed Test Data in Convex

Ensure your Convex development database has:
- A site configuration for `test-school`
- At least one public course with units and lessons
- The test users added as site users with appropriate roles

## Running Tests

### Run All Tests

```bash
pnpm test:e2e
```

### Run Tests with UI (Interactive Mode)

```bash
pnpm test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)

```bash
pnpm test:e2e:headed
```

### Run Tests in Debug Mode

```bash
pnpm test:e2e:debug
```

### View Test Report

```bash
pnpm test:e2e:report
```

### Run Specific Test File

```bash
pnpm test:e2e e2e/tests/navigation.spec.ts
```

### Run Tests with a Tag

```bash
pnpm test:e2e --grep "@smoke"
```

## Directory Structure

```
e2e/
├── fixtures/              # Test fixtures and utilities
│   ├── auth.fixture.ts    # Authentication helpers
│   ├── convex.fixture.ts  # Convex interaction utilities
│   └── index.ts           # Combined fixture exports
├── page-objects/          # Page Object Models
│   ├── admin.page.ts      # Admin page interactions
│   ├── courses.page.ts    # Courses page interactions
│   └── course-dashboard.page.ts  # Dashboard interactions
├── tests/                 # Test specifications
│   ├── admin.spec.ts      # Admin panel tests
│   ├── auth.spec.ts       # Authentication tests
│   ├── courses.spec.ts    # Courses listing tests
│   ├── course-management.spec.ts  # Course CRUD tests
│   └── navigation.spec.ts # Navigation tests
├── global.setup.ts        # Global test setup
└── README.md              # This file
```

## Writing Tests

### Using Fixtures

Import fixtures from the central index:

```typescript
import { test, expect, TEST_USERS } from "../fixtures";

test("my test", async ({ page, signIn }) => {
  await signIn(TEST_USERS.ADMIN);
  await page.goto("/admin");
  // ...
});
```

### Using Page Objects

```typescript
import { CoursesPage } from "../page-objects";

test("search courses", async ({ page }) => {
  const coursesPage = new CoursesPage(page);
  await coursesPage.goto();
  await coursesPage.search("math");
  expect(await coursesPage.getCourseCount()).toBeGreaterThan(0);
});
```

### Authentication Patterns

```typescript
// Sign in as different users
await signIn(TEST_USERS.ADMIN);   // Site admin
await signIn(TEST_USERS.EDITOR);  // Course editor
await signIn(TEST_USERS.USER);    // Regular user

// Sign out
await signOut();
```

## Best Practices

1. **Use Page Objects** - Encapsulate page interactions for maintainability
2. **Wait for Network** - Use `await page.waitForLoadState("networkidle")` after navigation
3. **Graceful Failures** - Check if elements exist before interacting
4. **Isolation** - Each test should be independent
5. **Data Setup** - Use fixtures to set up test data consistently

## Troubleshooting

### Clerk Authentication Issues

- Ensure `CLERK_SECRET_KEY` is set correctly
- Verify test users exist in your Clerk dashboard
- Check that `@clerk/testing` is properly configured

### Convex Connection Issues

- Verify `NEXT_PUBLIC_CONVEX_URL` is set
- Ensure your Convex dev server is running (`npx convex dev`)
- Check that test data exists in your Convex database

### Timeout Issues

- Increase timeout in `playwright.config.ts`
- Check network conditions
- Ensure the dev server is running

## CI/CD Integration

### Vercel Preview Deployments (Recommended)

The E2E tests are configured to run automatically against Vercel preview deployments. When you open a PR:

1. Vercel builds and deploys a preview
2. Vercel sends a `deployment_status` webhook to GitHub
3. GitHub Actions runs E2E tests against the preview URL

This approach tests your actual deployed code, including:
- Vercel edge functions and middleware
- Production-like environment variables
- Real CDN and caching behavior

**Required GitHub Secrets:**

```
# Clerk (required for auth)
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Convex (required for backend)
NEXT_PUBLIC_CONVEX_URL
CONVEX_DEPLOYMENT

# Test user credentials
E2E_USER_EMAIL
E2E_USER_PASSWORD
E2E_ADMIN_EMAIL
E2E_ADMIN_PASSWORD
E2E_EDITOR_EMAIL
E2E_EDITOR_PASSWORD
```

### Local Server Testing (Alternative)

To run tests against a local Next.js server in CI (useful for testing without Vercel):

1. Set the GitHub variable `RUN_E2E_TESTS=true`
2. The workflow will start a local server and run tests against it

```yaml
# GitHub Actions example
- name: Run E2E Tests
  run: pnpm test:e2e
  env:
    CI: true
    CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
    NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
```

### Testing Against Custom URLs

You can test against any deployed URL by setting `E2E_BASE_URL`:

```bash
# Test against Vercel preview
E2E_BASE_URL=https://your-project-xxx.vercel.app pnpm test:e2e

# Test against staging
E2E_BASE_URL=https://staging.yourdomain.com pnpm test:e2e

# Test against production (be careful!)
E2E_BASE_URL=https://yourdomain.com pnpm test:e2e
```

When `E2E_BASE_URL` points to an external URL (not localhost), Playwright will:
- Skip starting a local dev server
- Run tests directly against the provided URL

### Vercel Environment Variables Setup

For E2E tests to work against Vercel preview deployments, ensure these environment variables are set in your Vercel project settings (for Preview deployments):

```
# Clerk
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Convex
NEXT_PUBLIC_CONVEX_URL
CONVEX_DEPLOYMENT
```

**Note:** You may want to use separate Clerk/Convex instances for preview vs production to avoid test data contamination.

