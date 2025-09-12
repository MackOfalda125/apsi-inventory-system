import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/layout";
import { dashboardAPI } from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import "./dashboard.css";

const COLORS = ["#CDFAFA", "#C8AA6E", "#28A745", "#FFC107", "#DC3545"];

const Dashboard = () => {
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [ordersPerMonth, setOrdersPerMonth] = useState([]);
  const [revenueOverTime, setRevenueOverTime] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [orderStatusBreakdown, setOrderStatusBreakdown] = useState([]);
  const [invoicesByStatus, setInvoicesByStatus] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    dashboardAPI.fetchOrdersPerMonth(setLoading, setError, setOrdersPerMonth);
    dashboardAPI.fetchRevenueOverTime(setLoading, setError, setRevenueOverTime);
    dashboardAPI.fetchTopSellingItems(setLoading, setError, setTopSellingItems);
    dashboardAPI.fetchOrderStatusBreakdown(setLoading, setError, setOrderStatusBreakdown);
    dashboardAPI.fetchInvoicesByStatus(setLoading, setError, setInvoicesByStatus);
  }, []);

  return (
    <Layout currentScreen="Dashboard">
      <div className="dashboard-main">
        <h2>Dashboard Overview</h2>

        {loading && <p>Loading dashboard data...</p>}
        {error && <p className="text-danger">{error}</p>}

        {/* Orders per Month */}
        <div className="card">
          <h3>Orders per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersPerMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total_orders" stroke="#CDFAFA" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Over Time */}
        <div className="card">
          <h3>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueOverTime}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_revenue" fill="#C8AA6E" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Items */}
        <div className="card">
          <h3>Top Selling Items</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellingItems}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_sold" fill="#28A745" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Breakdown */}
        <div className="card">
          <h3>Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusBreakdown}
                dataKey="count"
                nameKey="status"
                outerRadius={100}
                label
              >
                {orderStatusBreakdown.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Invoices by Status */}
        <div className="card">
          <h3>Invoices by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={invoicesByStatus}
                dataKey="count"
                nameKey="status"
                outerRadius={100}
                label
              >
                {invoicesByStatus.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
