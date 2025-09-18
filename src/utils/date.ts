import { isSameMonth } from "date-fns";
import { Expense } from "../types";

export const currentMonthTotal = (expenses: Expense[]) => {
  const now = new Date();
  return expenses
    .filter(e => isSameMonth(new Date(e.date), now))
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
};
