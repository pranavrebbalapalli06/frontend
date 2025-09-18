import React, { useEffect, useState } from "react";
import { Expense } from "../types";
import "../index.css";

type Props = {
  initial?: Expense | null; // For update mode
  onSubmit: (exp: Expense) => Promise<void> | void;
  onCancel?: () => void;
  mode: "add" | "update"; // <-- Add mode prop
};

const categories = ["Food", "Travel", "Shopping", "Other"];

const ExpenseForm: React.FC<Props> = ({ initial, onSubmit, onCancel, mode }) => {
  const [exp, setExp] = useState<Expense>({
    category: "Food",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  useEffect(() => {
    if (mode === "update" && initial) {
      setExp({
        ...initial,
        date: (initial.date || "").slice(0, 10),
      });
    }
  }, [initial, mode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amount = Number(exp.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    await onSubmit({
      ...exp,
      amount,
      date: new Date(exp.date).toISOString(),
    });

    if (mode === "add") resetForm();
  };

  const handleChange = (key: keyof Expense, value: string | number) => {
    setExp((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setExp({
      category: "Food",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      description: "",
    });
  };

  // Show placeholder if in update mode but no expense selected
  if (mode === "update" && !initial) {
    return (
      <div className="max-w-lg mx-auto p-24 bg-white rounded-2xl  text-center text-gray-500">
        <p>Choose an expense from the table to update.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {mode === "update" ? "Update Expense" : "Add New Expense"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <select
            value={exp.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            min="1"
            value={exp.amount || ""}
            onChange={(e) => handleChange("amount", e.target.value ? Number(e.target.value) : 0)}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="Enter amount"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={exp.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optional)</label>
          <input
            type="text"
            value={exp.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="E.g., Lunch with friends"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
          >
            {mode === "update" ? "Update" : "Add"} Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
