const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    // Exclude Next.js pages (tested via E2E, not unit tests)
    "!app/**",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    // Exclude index files (just exports)
    "!**/index.{js,ts}",
    // Exclude non-critical utility files
    "!lib/design-tokens.ts",
    "!lib/focus-management.ts",
    "!lib/mockData.ts",
    // Exclude non-critical UI components
    "!components/KeyboardShortcuts*.tsx",
    "!components/ErrorBoundary.tsx",
  ],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/__test-utils/"],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 45,
      lines: 50,
      statements: 50,
    },
    // Higher thresholds for critical tested modules
    "./lib/auth.ts": {
      lines: 95,
      statements: 95,
    },
    "./lib/export.ts": {
      lines: 90,
      statements: 90,
    },
    "./lib/utils.ts": {
      lines: 100,
      statements: 100,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
