import { defineConfig } from "eslint/config";

import { baseConfig } from "@ocw/eslint-config/base";
import { reactConfig } from "@ocw/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
