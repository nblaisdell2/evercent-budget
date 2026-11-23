import { isDevEnvironment } from "@/lib/app-environment";

/**
 * A slim amber strip across the top of every page of the private dev site
 * (dev.testapisite.net), so nobody mistakes it for the live app. Amber is the
 * app's "not finished yet" color (partly funded); the words carry the meaning
 * on their own, so it doesn't rely on color. Renders nothing in production and
 * locally.
 *
 * Its height is fixed (--dev-banner-h in app/globals.css) because the budget
 * screen fills the window exactly and subtracts it; keep the text short
 * enough for one line on a 320px-wide screen.
 */
export function DevBanner() {
  if (!isDevEnvironment()) return null;
  return (
    <div
      data-dev-banner
      className="flex h-(--dev-banner-h) items-center overflow-hidden bg-state-partial px-4 text-meta font-semibold whitespace-nowrap text-fg-on-fill sm:px-6 lg:px-8"
    >
      <p className="truncate">Dev site, for testing only</p>
    </div>
  );
}
