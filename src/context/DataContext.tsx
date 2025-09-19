import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { Expense } from "../types";

type DataContextType = {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Expense[]>("/api/expenses");
      setExpenses(res.data);
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to fetch expenses");
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Expense) => {
    try {
      await api.post("/api/expenses", expense);
      await fetchExpenses(); // Refresh data after adding
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to add expense");
      throw err;
    }
  };

  const updateExpense = async (expense: Expense) => {
    if (!expense._id) return;
    try {
      await api.put(`/api/expenses/${expense._id}`, expense);
      await fetchExpenses(); // Refresh data after updating
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to update expense");
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await api.delete(`/api/expenses/${id}`);
      await fetchExpenses(); // Refresh data after deleting
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to delete expense");
      throw err;
    }
  };

  const refreshData = async () => {
    await fetchExpenses();
  };

  // Fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <DataContext.Provider value={{
      expenses,
      loading,
      error,
      fetchExpenses,
      addExpense,
      updateExpense,
      deleteExpense,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
