/**
 * Combined E2E Test Fixtures
 *
 * This module merges all fixtures together to provide a unified
 * test context with authentication, Convex, and page utilities.
 */

import { mergeTests } from "@playwright/test";
import {
  ADMIN_AUTH_STATE,
  test as authTest,
  EDITOR_AUTH_STATE,
  expect,
  signInUser,
  TEST_USERS,
  USER_AUTH_STATE,
} from "./auth.fixture";
import type { TestUser } from "./auth.fixture";
import {
  test as convexTest,
  createTestDataTracker,
  E2E_TEST_SCHOOLS,
} from "./convex.fixture";

export const test = mergeTests(authTest, convexTest);
export {
  expect,
  TEST_USERS,
  USER_AUTH_STATE,
  ADMIN_AUTH_STATE,
  EDITOR_AUTH_STATE,
  signInUser,
  E2E_TEST_SCHOOLS,
  createTestDataTracker,
  type TestUser,
};
