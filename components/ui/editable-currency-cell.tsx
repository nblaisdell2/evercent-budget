"use client";

import { useEffect, useRef, useState } from "react";
import { formatCents, parseCents, toEditableString, type Cents } from "@/lib/format/currency";

/**
 * One click-to-edit money cell, used by BOTH the BUDGETED column and the
 * AVAILABLE pill. YNAB-style: click the value, type, Enter or blur commits,
 * Escape reverts.
 *
 * Two details that matter more than they look:
 *
 * 1. The input and the display share identical box dimensions and type styles.
 *    If they differ by even a pixel the row visibly jumps on click, which is the
 *    classic bug in this pattern.
 * 2. The input is seeded with a bare numeric string ("1000.00") — no "$", no
 *    commas — so the user never has to delete formatting before typing.
 *
 * `isEditing` is owned by the table reducer rather than local state. That is
 * what guarantees only one cell is ever open, and it makes "Tab commits and
 * moves to the next cell" a reducer change later rather than a rewrite.
 */
export function EditableCurrencyCell({
  valueCents,
  isEditing,
  onStartEdit,
  onCommit,
  onCancel,
  ariaLabel,
  className = "",
  boxClassName = "",
}: {
  valueCents: Cents;
  isEditing: boolean;
  onStartEdit: () => void;
  onCommit: (cents: Cents) => void;
  onCancel: () => void;
  ariaLabel: string;
  /** Type + color classes shared by both states. */
  className?: string;
  /** Box geometry shared by both states (width, height, padding, alignment). */
  boxClassName?: string;
}) {
  if (isEditing) {
    return (
      <CurrencyInput
        initialCents={valueCents}
        onCommit={onCommit}
        onCancel={onCancel}
        ariaLabel={ariaLabel}
        className={className}
        boxClassName={boxClassName}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onStartEdit}
      className={`${boxClassName} ${className} cursor-text tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-accent`}
    >
      {formatCents(valueCents)}
    </button>
  );
}

/**
 * Split out as its own component on purpose: it only exists while a cell is
 * being edited, so mounting seeds the draft from the current value and
 * unmounting discards it. That makes a reset effect unnecessary — a cancelled
 * edit cannot leak into the next one because there is no state to leak.
 */
function CurrencyInput({
  initialCents,
  onCommit,
  onCancel,
  ariaLabel,
  className,
  boxClassName,
}: {
  initialCents: Cents;
  onCommit: (cents: Cents) => void;
  onCancel: () => void;
  ariaLabel: string;
  className: string;
  boxClassName: string;
}) {
  const [draft, setDraft] = useState(() => toEditableString(initialCents));
  const inputRef = useRef<HTMLInputElement>(null);

  // Select-on-mount so typing replaces rather than appends. No setState here,
  // so this stays a legitimate use of an effect.
  useEffect(() => {
    inputRef.current?.select();
  }, []);

  function commit() {
    const parsed = parseCents(draft);
    if (parsed === null) onCancel();
    else onCommit(parsed);
  }

  return (
    <input
      ref={inputRef}
      autoFocus
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      className={`${boxClassName} ${className} bg-transparent tabular-nums outline-none ring-1 ring-border-accent`}
    />
  );
}
