import Image from "next/image";

/**
 * EverCent's logo: the calendar-and-rising-arrow mark, and the lockup of the
 * mark beside the "EverCent" wordmark.
 *
 * The mark file is pre-trimmed to the artwork and pre-sized (256px, enough for
 * every size it's shown at on high-density screens), so it's served as is
 * (`unoptimized`) rather than run through Next's image resizer. The full-size
 * original lives in assets/brand/.
 */
const MARK_SRC = "/brand/evercent-mark.webp";

const MARK_SIZES = {
  sm: "size-[1.75rem]",
  md: "size-[2rem]",
  lg: "size-[2.25rem]",
} as const;

type MarkSize = keyof typeof MARK_SIZES;

/**
 * The mark on its own. `label` is its accessible name. Pass an empty string
 * when the word "EverCent" is already next to it, so screen readers don't hear
 * the name twice.
 */
export function EverCentMark({
  size = "md",
  label = "EverCent",
  className = "",
}: {
  size?: MarkSize;
  label?: string;
  className?: string;
}) {
  return (
    <Image
      src={MARK_SRC}
      width={256}
      height={256}
      alt={label}
      unoptimized
      loading="eager"
      className={`shrink-0 select-none ${MARK_SIZES[size]} ${className}`}
      draggable={false}
    />
  );
}

const WORDMARK_SIZES: Record<MarkSize, string> = {
  sm: "text-[1.125rem]",
  md: "text-[1.375rem]",
  lg: "text-[1.5rem]",
};

/**
 * Mark + wordmark, centered on one line. The wordmark keeps M PLUS 1 Bold, the
 * brand face. `leading-none` makes the text box hug the glyphs so flex
 * centering lines the letters up with the middle of the mark.
 */
export function EverCentLockup({ size = "md" }: { size?: MarkSize }) {
  return (
    <span className="inline-flex items-center gap-[0.5rem]">
      <EverCentMark size={size} label="" />
      <span className={`font-brand leading-none font-bold text-fg-wordmark ${WORDMARK_SIZES[size]}`}>
        EverCent
      </span>
    </span>
  );
}
