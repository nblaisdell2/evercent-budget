import Link from "next/link";
import { EverCentLockup } from "@/components/brand/evercent-logo";
import { SIGN_IN_URL, SIGN_UP_URL } from "@/lib/auth/routes";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-rule">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <EverCentLockup size="sm" />
          <p className="mt-2.5 text-[0.875rem] font-medium text-fg-muted">
            © {new Date().getFullYear()} EverCent
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-[0.9375rem] font-semibold">
          <Link
            href={SIGN_IN_URL}
            className="rounded-card text-fg-secondary hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-accent"
          >
            Log in
          </Link>
          <Link
            href={SIGN_UP_URL}
            className="rounded-card text-fg-secondary hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-accent"
          >
            Create account
          </Link>
        </nav>
      </div>
    </footer>
  );
}
