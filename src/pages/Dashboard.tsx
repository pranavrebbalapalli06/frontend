import React, { useMemo, useState } from "react";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { Expense } from "../types";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

const getMonthlyTotal = (expenses: Expense[]) => {
  const now = new Date();
  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);
};

const getWeeklyTotal = (expenses: Expense[]) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d >= startOfWeek && d < endOfWeek;
    })
    .reduce((sum, e) => sum + e.amount, 0);
};

const getYearlyTotal = (expenses: Expense[]) => {
  const now = new Date();
  return expenses
    .filter((e) => new Date(e.date).getFullYear() === now.getFullYear())
    .reduce((sum, e) => sum + e.amount, 0);
};

const Dashboard: React.FC = () => {
  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useData();
  const [editing, setEditing] = useState<Expense | null>(null);

  const [filterInput, setFilterInput] = useState({ category: "All", from: "", to: "" });
  const [filters, setFilters] = useState({ category: "All", from: "", to: "" });

  const [activeTab, setActiveTab] = useState<"add" | "update">("add");

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat = filters.category === "All" || e.category === filters.category;
      const d = new Date(e.date);
      const fromOk = !filters.from || d >= new Date(filters.from);
      const toOk = !filters.to || d <= new Date(filters.to);
      return matchCat && fromOk && toOk;
    });
  }, [expenses, filters]);

  const handleAddExpense = async (exp: Expense) => {
    try {
      await addExpense(exp);
    } catch (err) {
      // Error is handled in DataContext
    }
  };

  const handleUpdateExpense = async (exp: Expense) => {
    if (!exp._id) return;
    try {
      await updateExpense(exp);
      setEditing(null);
      setActiveTab("add");
    } catch (err) {
      // Error is handled in DataContext
    }
  };

  const handleRemoveExpense = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (err) {
      // Error is handled in DataContext
    }
  };

  const monthlyTotal = useMemo(() => getMonthlyTotal(expenses), [expenses]);
  const weeklyTotal = useMemo(() => getWeeklyTotal(expenses), [expenses]);
  const yearlyTotal = useMemo(() => getYearlyTotal(expenses), [expenses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 pb-12 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Totals */}
        <section>
          <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 text-gray-800 rounded-xl shadow text-center">
            <h3 className="text-lg font-medium">This Week</h3>
            <p className="text-3xl font-bold mt-1">₹ {weeklyTotal.toFixed(2)}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 text-gray-800 rounded-xl shadow text-center">
            <h3 className="text-lg font-medium">In This Month</h3>
            <p className="text-3xl font-bold mt-1">₹ {monthlyTotal.toFixed(2)}</p>
          </div>
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 rounded-xl shadow text-center">
            <h3 className="text-lg font-medium">This Year</h3>
            <p className="text-3xl font-bold mt-1">₹ {yearlyTotal.toFixed(2)}</p>
          </div>
        </section>

        {/* Tabs for Add / Update */}
        <section>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => {
                      setActiveTab("add");
                      setEditing(null); // Reset editing when switching to Add
                    }}
                    className={`px-4 py-2 rounded-lg ${activeTab === "add" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Add Expense
                  </button>
                  <button
                    onClick={() => setActiveTab("update")}
                    className={`px-4 py-2 rounded-lg ${activeTab === "update" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    Update Expense
                  </button>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-md">
                  {activeTab === "add" ? (
                    <ExpenseForm mode="add" onSubmit={handleAddExpense} />
                  ) : (
                    <ExpenseForm
                      mode="update"
                      initial={editing} // Pass the expense being edited
                      onSubmit={handleUpdateExpense}
                      onCancel={() => setEditing(null)}
                    />
                  )}
                </div>
  </section>


      
        {/* Table */}
        <section>
          <div className="bg-white rounded-xl shadow-md p-4">
            <ExpenseTable items={filtered} onEdit={(e) => { setEditing(e); setActiveTab("update"); }} onDelete={handleRemoveExpense} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
