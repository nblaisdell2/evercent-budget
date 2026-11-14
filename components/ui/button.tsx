import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Every action on the screen starts from the same tinted fill, so anything you
 * can press looks pressable. cva keeps that mapping in one declarative table.
 *
 * Exported as `buttonStyles` so a `<Link>` that navigates can look exactly like
 * a `<button>` that acts, without either pretending to be the other element.
 */
export const buttonStyles = cva(
  "inline-flex items-center gap-2 rounded-control font-bold transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent",
  {
    variants: {
      variant: {
        tinted:
          "bg-surface-control text-fg-accent hover:bg-surface-control-strong hover:text-fg-primary",
        /** The current choice in a set, such as This month. */
        selected: "bg-surface-control-strong text-fg-primary",
        /** The one main action on a page, such as Create your budget. */
        primary:
          "bg-surface-control-strong text-fg-primary hover:bg-surface-control-hover focus-visible:outline-fg-primary",
        /** Looks like tinted until hovered, then warns. The reset actions. */
        destructive:
          "bg-surface-control text-fg-accent hover:bg-state-overspent hover:text-state-overspent-fg",
      },
      size: {
        md: "h-control px-2.25 text-row",
        /** The landing page header: a step up from the app's dense controls. */
        nav: "h-9 px-3.5 text-[0.875rem]",
        /** Landing and sign-in pages, where a button is read, not scanned. */
        lg: "h-11 px-4.5 text-[1rem]",
        icon: "size-control justify-center",
        iconSmall: "size-6.5 justify-center",
        chip: "h-6 justify-center px-1 text-meta whitespace-nowrap",
      },
    },
    defaultVariants: { variant: "tinted", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & { children: ReactNode };

export function Button({ variant, size, className = "", children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={cn(buttonStyles({ variant, size }), className)} {...rest}>
      {children}
    </button>
  );
}
