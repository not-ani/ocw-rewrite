import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@ocw/eslint-config/base";
import { nextjsConfig } from "@ocw/eslint-config/nextjs";
import { reactConfig } from "@ocw/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
