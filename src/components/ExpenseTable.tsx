import React, { useMemo, useState } from "react";
import { Expense } from "../types";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  items: Expense[];
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
};

const ExpenseTable: React.FC<Props> = ({ items, onEdit, onDelete }) => {
  // Local filter state
  const [filterInput, setFilterInput] = useState({ category: "All", from: "", to: "" });
  const [filters, setFilters] = useState({ category: "All", from: "", to: "" });

  // Apply & clear filter handlers
  const applyFilters = () => setFilters({ ...filterInput });
  const clearFilters = () => {
    setFilterInput({ category: "All", from: "", to: "" });
    setFilters({ category: "All", from: "", to: "" });
  };

  // Filtering logic
  const filteredItems = useMemo(() => {
    return items.filter((e) => {
      const matchCat = filters.category === "All" || e.category === filters.category;
      const d = new Date(e.date);
      const fromOk = !filters.from || d >= new Date(filters.from);
      const toOk = !filters.to || d <= new Date(filters.to);
      return matchCat && fromOk && toOk;
    });
  }, [items, filters]);

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-lg">
        No expenses found. Start adding your first one!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white">
      {/* Filter UI */}
      <section className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filterInput.category}
          onChange={(e) => setFilterInput((f) => ({ ...f, category: e.target.value }))}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option>All</option>
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Other</option>
        </select>

        <label className="text-sm">
          From:
          <input
            type="date"
            value={filterInput.from}
            onChange={(e) => setFilterInput((f) => ({ ...f, from: e.target.value }))}
            className="ml-2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </label>

        <label className="text-sm">
          To:
          <input
            type="date"
            value={filterInput.to}
            onChange={(e) => setFilterInput((f) => ({ ...f, to: e.target.value }))}
            className="ml-2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </label>

        <button onClick={applyFilters} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">
          Apply
        </button>
        <button onClick={clearFilters} className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition">
          Clear
        </button>
      </section>

      {/* Expense Table */}
      <table className="w-full text-left border-collapse">
        <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <tr>
            <th className="py-3 px-4 font-semibold">Date</th>
            <th className="py-3 px-4 font-semibold">Category</th>
            <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
            <th className="py-3 px-4 font-semibold">Description</th>
            <th className="py-3 px-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((e) => (
            <tr key={e._id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-gray-700">{new Date(e.date).toLocaleDateString()}</td>
              <td className="py-3 px-4 text-gray-700">{e.category}</td>
              <td className="py-3 px-4 text-right font-medium text-green-600">₹{e.amount.toFixed(2)}</td>
              <td className="py-3 px-4 text-gray-600">{e.description}</td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onEdit(e)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 mr-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  <Pencil size={16} /> Edit
                </button>
                {e._id && (
                  <button
                    onClick={() => onDelete(e._id!)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
