import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DevBanner } from "./dev-banner";

describe("DevBanner", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("tells people they're on the dev site", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "dev");
    render(<DevBanner />);
    expect(screen.getByText("Dev site, for testing only")).toBeInTheDocument();
  });

  it("shows nothing in production", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", undefined);
    const { container } = render(<DevBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
