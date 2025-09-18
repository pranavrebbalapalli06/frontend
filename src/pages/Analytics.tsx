import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import api from "../services/api";
import { Expense } from "../types";

type TimeFilter = "all" | "lastMonth" | "last3Months" | "last6Months" | "thisYear" | "custom";
type ChartType = "bar" | "pie" | "line";

// Improved color palette with better contrast and professional look
const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green  
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
];

// Custom tooltip formatter for currency
const formatCurrency = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

// Custom Y-axis formatter
const formatYAxis = (value: number) => {
  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const Analytics: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [customDateRange, setCustomDateRange] = useState({ from: "", to: "" });
  const [chartType, setChartType] = useState<ChartType>("bar");

  // Fetch expenses data
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get<Expense[]>("/expenses");
      setExpenses(res.data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filter expenses based on current filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Category filter
      const categoryMatch = categoryFilter === "All" || expense.category === categoryFilter;
      
      // Time filter
      const expenseDate = new Date(expense.date);
      const now = new Date();
      let timeMatch = true;

      switch (timeFilter) {
        case "lastMonth":
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          timeMatch = expenseDate >= lastMonthStart && expenseDate <= lastMonthEnd;
          break;
        case "last3Months":
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          timeMatch = expenseDate >= threeMonthsAgo;
          break;
        case "last6Months":
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          timeMatch = expenseDate >= sixMonthsAgo;
          break;
        case "thisYear":
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          timeMatch = expenseDate >= startOfYear;
          break;
        case "custom":
          const fromDate = customDateRange.from ? new Date(customDateRange.from + 'T00:00:00') : null;
          const toDate = customDateRange.to ? new Date(customDateRange.to + 'T23:59:59') : null;
          timeMatch = (!fromDate || expenseDate >= fromDate) && (!toDate || expenseDate <= toDate);
          break;
        default:
          timeMatch = true;
      }

      return categoryMatch && timeMatch;
    });
  }, [expenses, categoryFilter, timeFilter, customDateRange]);

  // Prepare data for bar chart (monthly expenses by category)
  const barChartData = useMemo(() => {
    const monthlyData: Record<string, Record<string, any>> = {};
    const allCategories = new Set<string>();
    
    // First pass: collect all categories
    filteredExpenses.forEach((expense) => {
      allCategories.add(expense.category);
    });
    
    // Second pass: build monthly data
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel };
        // Initialize all categories to 0
        allCategories.forEach(cat => {
          monthlyData[monthKey][cat] = 0;
        });
      }
      
      monthlyData[monthKey][expense.category] += expense.amount;
    });

    return Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredExpenses]);

  // Prepare data for pie chart (category distribution)
  const pieChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    filteredExpenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Prepare data for line chart (daily expenses)
  const lineChartData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = (dailyData[dateKey] || 0) + expense.amount;
    });

    return Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredExpenses]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(expenses.map(e => e.category)));
    return ["All", ...uniqueCategories];
  }, [expenses]);

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
            <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500">Average per Transaction</h3>
            <p className="text-2xl font-bold text-gray-900">
              {filteredExpenses.length > 0 ? formatCurrency(totalAmount / filteredExpenses.length) : '₹0'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-500">Categories</h3>
            <p className="text-2xl font-bold text-gray-900">{pieChartData.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="lastMonth">Last Month</option>
                <option value="last3Months">Last 3 Months</option>
                <option value="last6Months">Last 6 Months</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {timeFilter === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={customDateRange.from}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={customDateRange.to}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
            </div>
              </>
            )}

            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartType)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="line">Line Chart</option>
              </select>
            </div>
        </div>
      </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              {chartType === "bar" && "Monthly Expenses by Category"}
              {chartType === "pie" && "Expense Distribution by Category"}
              {chartType === "line" && "Daily Expense Trend"}
            </h2>
            <div className="w-full" style={{ height: 400 }}>
              {chartType === "bar" && barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#D1D5DB' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#D1D5DB' }}
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: '#F9FAFB', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    {pieChartData.map((category, index) => (
                      <Bar 
                        key={category.name} 
                        dataKey={category.name} 
                        stackId="a" 
                        fill={COLORS[index % COLORS.length]}
                        radius={[0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : chartType === "pie" && pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                      data={pieChartData}
                  cx="50%"
                  cy="50%"
                      outerRadius={100}
                      innerRadius={30}
                      paddingAngle={2}
                  dataKey="value"
                      label={(entry: any) => 
                        entry.percent > 0.05 ? `${entry.name} ${(entry.percent * 100).toFixed(0)}%` : ''
                      }
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      contentStyle={{ 
                        backgroundColor: '#F9FAFB', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: '#6B7280' }}
                    />
              </PieChart>
            </ResponsiveContainer>
              ) : chartType === "line" && lineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#D1D5DB' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#D1D5DB' }}
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: '#F9FAFB', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm">Try adjusting your filters or add some expenses</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
            <div className="space-y-4">
              {pieChartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3 shadow-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</div>
                    <div className="text-xs text-gray-500">
                      {totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.slice(0, 10).map((expense) => (
                  <tr key={expense._id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{expense.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{expense.description || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found for the selected filters
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
