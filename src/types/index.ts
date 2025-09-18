export type Category = "Food" | "Travel" | "Shopping" | "Other";

export interface Expense {
  _id?: string;
  category: Category | string;
  amount: number;
  date: string;       // ISO string for simplicity
  description?: string;
}

export interface UserCredentials {
  name?: string;
  email: string;
  password: string;
}
