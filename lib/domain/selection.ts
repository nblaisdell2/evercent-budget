import type { CategoryGroup } from "./types";

/** Tri-state checkbox value. "mixed" is expressed to AT via aria-checked. */
export type CheckState = boolean | "mixed";

export type SelectedIds = Record<string, true>;

function stateFor(total: number, selected: number): CheckState {
  if (total === 0 || selected === 0) return false;
  if (selected === total) return true;
  return "mixed";
}

/** A group's own checkbox reflects how many of its categories are selected. */
export function getGroupCheckState(group: CategoryGroup, selected: SelectedIds): CheckState {
  const ids = group.categories.map((c) => c.id);
  return stateFor(ids.length, ids.filter((id) => selected[id]).length);
}

/** The header select-all reflects every category across every group. */
export function getHeaderCheckState(groups: CategoryGroup[], selected: SelectedIds): CheckState {
  const ids = groups.flatMap((g) => g.categories.map((c) => c.id));
  return stateFor(ids.length, ids.filter((id) => selected[id]).length);
}

/** Toggling a group cascades to all of its categories. */
export function toggleGroup(group: CategoryGroup, selected: SelectedIds): SelectedIds {
  const turnOn = getGroupCheckState(group, selected) !== true;
  const next = { ...selected };
  for (const category of group.categories) {
    if (turnOn) next[category.id] = true;
    else delete next[category.id];
  }
  return next;
}

export function toggleCategory(categoryId: string, selected: SelectedIds): SelectedIds {
  const next = { ...selected };
  if (next[categoryId]) delete next[categoryId];
  else next[categoryId] = true;
  return next;
}

/** Header select-all: any partial or empty state selects everything. */
export function toggleAll(groups: CategoryGroup[], selected: SelectedIds): SelectedIds {
  if (getHeaderCheckState(groups, selected) === true) return {};
  const next: SelectedIds = {};
  for (const group of groups) {
    for (const category of group.categories) next[category.id] = true;
  }
  return next;
}

export function countSelected(selected: SelectedIds): number {
  return Object.keys(selected).length;
}
