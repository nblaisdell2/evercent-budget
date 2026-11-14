"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AutoModeIcon, ChartLineIcon, WalletIcon } from "@/components/icons";
import type { ReactNode } from "react";

const NAV_ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/budget", label: "Budget", icon: <WalletIcon width={20} height={17} /> },
  { href: "/automation", label: "Automation", icon: <AutoModeIcon width={20} height={20} /> },
  { href: "/reporting", label: "Reporting", icon: <ChartLineIcon width={20} height={20} /> },
];

export function NavList() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-[0.125rem]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex h-navitem items-center gap-[0.5625rem] rounded-control pl-[0.5rem] transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent",
                  active
                    ? "bg-surface-control-strong text-nav font-bold text-fg-primary"
                    : "text-nav font-medium text-fg-secondary hover:bg-surface-control hover:text-fg-primary",
                ].join(" ")}
              >
                <span className="grid w-[1.25rem] shrink-0 place-items-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
