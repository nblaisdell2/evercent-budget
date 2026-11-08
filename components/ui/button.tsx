import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Every action on the screen starts from the same tinted fill, so anything you
 * can press looks pressable. cva keeps that mapping in one declarative table.
 */
const button = cva(
  "inline-flex items-center gap-[0.5rem] rounded-control font-bold transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent",
  {
    variants: {
      variant: {
        tinted:
          "bg-surface-control text-fg-accent hover:bg-surface-control-strong hover:text-fg-primary",
        /** The current choice in a set, such as This month. */
        selected: "bg-surface-control-strong text-fg-primary",
        /** Looks like tinted until hovered, then warns. The reset actions. */
        destructive:
          "bg-surface-control text-fg-accent hover:bg-state-overspent hover:text-state-overspent-fg",
      },
      size: {
        md: "h-control px-[0.5625rem] text-row",
        icon: "size-control justify-center",
        iconSmall: "size-[1.625rem] justify-center",
        chip: "h-[1.5rem] justify-center px-[0.25rem] text-meta whitespace-nowrap",
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
