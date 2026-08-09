# instant-nav rig: OCW web

- BUILD: from `apps/web`, run `EXPOSE_TESTING_API=1 bun run build`, then `EXPOSE_TESTING_API=1 bun run start --port 3001`; Next re-evaluates the config at startup, so both commands need the flag.
- EXPOSE: `process.env.EXPOSE_TESTING_API === "1"` enables `experimental.exposeTestingApiInProductionBuild`; normal production builds leave it disabled.
- RUN: from `apps/web`, run the focused Playwright spec with `E2E_BASE_URL=http://localhost:3001`.
- TEST USER: the guarded public navigation runs signed out and needs no login state; role, plan, and feature flags are not involved.
- DRIFT: the root-domain privacy route has no tenant or Convex seed dependency; hostname rewrites can still change routing, so the test pins `localhost`.
- LOOP: local production build → start on port 3001 → focused Playwright test → inspect failure → fix → repeat; stop any previous app server first and fail on `EADDRINUSE`.
- LIVENESS: not applicable because every verdict uses the freshly built local artifact.
- WALLS: the production build requires the app's configured Clerk, Convex, PostHog, UploadThing, and PostHog API environment variables.
