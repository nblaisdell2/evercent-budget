import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SentryTestButtons } from "./sentry-test-buttons";

const { captureException } = vi.hoisted(() => ({
  captureException: vi.fn(() => "test-event-id"),
}));

vi.mock("@sentry/nextjs", () => ({ captureException }));
// The real server action needs Next.js and Clerk; this test is about the browser button.
vi.mock("@/app/(app)/debug/sentry/actions", () => ({ throwTestServerError: vi.fn() }));

describe("SentryTestButtons", () => {
  it("sends one browser test error to Sentry and announces it", async () => {
    const user = userEvent.setup();
    render(<SentryTestButtons />);

    await user.click(screen.getByRole("button", { name: "Send a browser test error" }));

    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "EverCent Sentry test error (browser)" }),
    );
    expect(
      screen.getByText("Sent a browser test error to Sentry (event test-event-id)."),
    ).toBeInTheDocument();
  });
});
