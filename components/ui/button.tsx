import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The design uses exactly two fills for controls: solid accent (#5555f3) and the
 * 29%-alpha accent tint. cva keeps that mapping in one declarative table.
 */
const button = cva(
  "inline-flex items-center gap-[0.5rem] rounded-control transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent",
  {
    variants: {
      variant: {
        /** Tinted fill, accent label — Add New Category, Move Money, Add Account */
        tinted: "bg-surface-control text-fg-accent hover:bg-surface-control-strong hover:text-fg-primary",
        /** Solid accent fill, white label — Reset All Budget Amounts */
        solid: "bg-surface-control-strong text-fg-primary hover:brightness-110",
        /** Tinted fill, white label — Reset Budgeted Amounts */
        subtle: "bg-surface-control text-fg-primary hover:bg-surface-control-strong",
        /** No fill, accent label — Undo / Redo */
        ghost: "text-fg-accent hover:text-fg-primary",
      },
      size: {
        /** Toolbar and rail buttons */
        md: "h-control px-[0.5625rem] text-row font-bold",
        /** Actions-card rows: full width, left-aligned label */
        row: "h-[1.625rem] w-full justify-start px-[0.4375rem] text-meta",
        /** Bare label + icon, no padding */
        bare: "text-row font-bold",
      },
    },
    defaultVariants: { variant: "tinted", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { children: ReactNode };

export function Button({ variant, size, className = "", children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={`${button({ variant, size })} ${className}`} {...rest}>
      {children}
    </button>
  );
}
