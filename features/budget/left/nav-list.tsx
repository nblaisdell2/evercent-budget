"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AutoModeIcon, ChartLineIcon, WalletIcon } from "@/components/icons";
import type { ReactNode } from "react";

const NAV_ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "Budget", icon: <WalletIcon width={30} height={26} /> },
  { href: "/automation", label: "Automation", icon: <AutoModeIcon width={30} height={30} /> },
  { href: "/reporting", label: "Reporting", icon: <ChartLineIcon width={30} height={30} /> },
];

export function NavList() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-[0.3125rem]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex h-navitem items-center gap-[0.75rem] rounded-control pl-[0.6875rem] transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent",
                  active
                    ? "bg-surface-control-strong text-nav font-black text-fg-primary"
                    : "text-nav font-medium text-fg-primary hover:bg-surface-control",
                ].join(" ")}
              >
                <span className="grid w-[1.875rem] shrink-0 place-items-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
