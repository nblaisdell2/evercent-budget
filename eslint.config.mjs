import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

/* Framework imports that must stay out of shared code. */
const FRAMEWORK = [
  {
    group: ["next", "next/*"],
    message: "Keep Next.js out of shared code; see CLAUDE.md > Architecture.",
  },
  { group: ["@clerk/*"], message: "Keep Clerk out of shared code; pass a userId in instead." },
  {
    group: ["react", "react-dom", "react/*"],
    message: "Keep React out of shared code; it belongs in components.",
  },
];

export default defineConfig([
  ...nextVitals,

  /* Pure logic shared with a future Expo app: no framework, no database. */
  {
    files: ["lib/domain/**", "lib/format/**", "lib/validation/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...FRAMEWORK,
            {
              group: ["@/lib/db", "@/lib/db/*", "pg", "kysely"],
              message: "Pure logic can't touch the database.",
            },
          ],
        },
      ],
    },
  },

  /* Services and repositories: may use the database, but no framework, so
     pages, server actions, API routes and scheduled jobs can all call them. */
  {
    files: ["lib/services/**", "lib/data/*-repository.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: FRAMEWORK }],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lib/db/schema.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
