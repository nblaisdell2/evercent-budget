import type { BudgetPageData, MonthKey } from "@/lib/domain/types";
import { placeholderBudgetPage } from "./placeholder";

export interface GetBudgetPageArgs {
  budgetId: string;
  month: MonthKey;
}

/**
 * THE SWAP SEAM.
 *
 * Every read the budget page performs goes through this interface. It is async
 * already, so replacing the placeholder implementation with a real database
 * query, server action, or API call requires no change in any component.
 */
export interface BudgetRepository {
  getBudgetPage(args: GetBudgetPageArgs): Promise<BudgetPageData>;
}

export const budgetRepository: BudgetRepository = {
  async getBudgetPage() {
    return placeholderBudgetPage;
  },
};
