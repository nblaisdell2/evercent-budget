// Runs before every component test (*.test.tsx).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount whatever the previous test rendered, so tests can't affect each other.
afterEach(() => {
  cleanup();
});
