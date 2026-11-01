"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import Loading from "@/components/admin/Loading";
import { motion, type Variants } from "framer-motion";
import {
  Package,
  PackageCheck,
  PackageX,
  FolderTree,
  Layers,
  Heart,
  ShoppingBag,
  Mail,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ---------- Types ----------

type Overview = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalCategories: number;
  totalSubcategories: number;
  totalInterestedProducts: number;
  totalInterestQuantity: number;
  totalContacts: number;
};

type DailyTrendPoint = {
  date: string;
  interestRequests: number;
  interestedQuantity: number;
  contactQueries: number;
};

type ProductByBlock = {
  block: string;
  count: number;
};

type TopInterestedProduct = {
  _id: string;
  title: string;
  requestCount: number;
  totalQuantity: number;
};

type RecentInterestedProduct = {
  _id: string;
  userName: string;
  userPhone: string;
  productSnapshot: { title: string };
  totalQuantity: number;
  isViewed: boolean;
  createdAt: string;
};

type RecentContact = {
  _id: string;
  name?: string;
  userName?: string;
  status: "Pending" | "Accepted" | "Rejected" | string;
  createdAt: string;
};

type Dashboard = {
  overview: Overview;
  InterestedProducts: { viewed: number; unviewed: number };
  contacts: { pending: number; accepted: number; rejected: number };
  charts: {
    dailyTrend: DailyTrendPoint[];
    productsByBlock: ProductByBlock[];
  };
  topInterestedProducts: TopInterestedProduct[];
  recentInterestedProducts: RecentInterestedProduct[];
  recentContacts: RecentContact[];
};

// ---------- Animated counter ----------

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    const from = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + (value - from) * eased));

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    }

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value]);

  return <>{display.toLocaleString("en-IN")}</>;
}

// ---------- Page background (light pastel mesh) ----------

function PageBackground() {
  const gridMask =
    "radial-gradient(ellipse at top, black 30%, transparent 75%)";

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50 to-fuchsia-50" />

      {/* faint dotted-grid, fades out toward the bottom */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: gridMask,
          WebkitMaskImage: gridMask,
        }}
      />

      {/* pastel aurora blobs */}
      <motion.div
        className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.35), transparent 70%)",
        }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-20 -right-24 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(217,70,239,0.25), transparent 70%)",
        }}
        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[45%] -left-32 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)",
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 right-0 h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(52,211,153,0.28), transparent 70%)",
        }}
        animate={{ x: [0, -30, 0], y: [0, -30, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* soft white wash on top so content stays crisp */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.35),transparent_70%)]" />
    </div>
  );
}

// ---------- Theme constants ----------

const COLORS = {
  primary: "#818cf8",
  green: "#4ade80",
  red: "#f87171",
  amber: "#fbbf24",
  blue: "#38bdf8",
  pink: "#e879f9",
  slate: "#94a3b8",
};

const PIE_COLORS = [COLORS.primary, COLORS.slate];
const CONTACT_COLORS = [COLORS.amber, COLORS.green, COLORS.red];
const BLOCK_COLORS = [
  COLORS.primary,
  COLORS.blue,
  COLORS.pink,
  COLORS.amber,
  COLORS.green,
];

// Frosted white glass cards (override shadcn Card defaults)
const glassCard =
  "h-full border-white/80 bg-white/70 text-slate-900 backdrop-blur-md shadow-lg shadow-indigo-500/5";
const cardTitle = "text-base text-slate-900";
const mutedText = "text-slate-500";

// Recharts light-mode helpers
const axisTick = { fill: "#64748b" };
const gridStroke = "rgba(100,116,139,0.18)";
const tooltipStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(148,163,184,0.35)",
  borderRadius: 12,
  color: "#0f172a",
  boxShadow: "0 10px 25px -5px rgba(79,70,229,0.15)",
};
const tooltipLabelStyle: React.CSSProperties = { color: "#475569" };
const tooltipItemStyle: React.CSSProperties = { color: "#0f172a" };
const legendFormatter = (value: string) => (
  <span style={{ color: "#475569" }}>{value}</span>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<7 | 30>(7);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetchDashboardFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  async function fetchDashboardFunc() {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URL}/admin/dashboard`, {
        params: { days },
        withCredentials: true,
      });
      setDashboard(res?.data?.data);
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value: string) {
    const date = new Date(value);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }

  function formatDateTime(value: string) {
    const date = new Date(value);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Soft pastel badges for the light theme
  function statusBadgeClass(status: string) {
    if (status === "Accepted")
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    if (status === "Rejected") return "border-red-200 bg-red-100 text-red-700";
    return "border-amber-200 bg-amber-100 text-amber-700";
  }

  function viewedBadgeClass(isViewed: boolean) {
    return isViewed
      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
      : "border-indigo-200 bg-indigo-100 text-indigo-700";
  }

  if (!dashboard) {
    return (
      <>
        {loading && <Loading />}
        <div className="relative isolate min-h-screen overflow-hidden bg-slate-50 p-6 text-sm text-slate-500">
          <PageBackground />
          {!loading && "No dashboard data available."}
        </div>
      </>
    );
  }

  const overview = dashboard.overview;

  const statCards = [
    {
      label: "Total Products",
      value: overview.totalProducts,
      icon: Package,
      color: COLORS.primary,
    },
    {
      label: "Active Products",
      value: overview.activeProducts,
      icon: PackageCheck,
      color: COLORS.green,
    },
    {
      label: "Inactive Products",
      value: overview.inactiveProducts,
      icon: PackageX,
      color: COLORS.red,
    },
    {
      label: "Categories",
      value: overview.totalCategories,
      icon: FolderTree,
      color: COLORS.blue,
    },
    {
      label: "Subcategories",
      value: overview.totalSubcategories,
      icon: Layers,
      color: COLORS.pink,
    },
    {
      label: "Interested Products",
      value: overview.totalInterestedProducts,
      icon: Heart,
      color: COLORS.amber,
    },
    {
      label: "Interested Quantity",
      value: overview.totalInterestQuantity,
      icon: ShoppingBag,
      color: COLORS.slate,
    },
    {
      label: "Contact Queries",
      value: overview.totalContacts,
      icon: Mail,
      color: COLORS.primary,
    },
  ];

  const interestedPieData = [
    { name: "Viewed", value: dashboard.InterestedProducts.viewed },
    { name: "Not Viewed", value: dashboard.InterestedProducts.unviewed },
  ];

  const contactPieData = [
    { name: "Pending", value: dashboard.contacts.pending },
    { name: "Accepted", value: dashboard.contacts.accepted },
    { name: "Rejected", value: dashboard.contacts.rejected },
  ];

  return (
    <>
      {loading && <Loading />}
      <div className="relative isolate flex min-h-screen flex-col gap-6 overflow-hidden bg-slate-50 p-6">
        <PageBackground />

        {/* Hero: header + stat cards on frosted white glass */}
        <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/60 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur-xl md:p-8">
          {/* top highlight line */}
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent" />

          <div className="relative flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-2xl font-semibold text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-slate-500">
                  Overview of products, interest and contact activity
                </p>
              </div>
              <div className="flex gap-1 rounded-lg border border-slate-200 bg-white/70 p-1">
                <button
                  type="button"
                  onClick={() => setDays(7)}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    days === 7
                      ? "bg-slate-900 font-medium text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDays(30)}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    days === 30
                      ? "bg-slate-900 font-medium text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            {/* Stat cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-4 md:grid-cols-4"
            >
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label} variants={itemVariants}>
                    <div className="group relative overflow-hidden rounded-xl border border-white/90 bg-white/70 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background: `radial-gradient(circle at top right, ${stat.color}33, transparent 70%)`,
                        }}
                      />
                      {/* accent line */}
                      <div
                        className="absolute inset-x-0 top-0 h-0.5 opacity-80"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                        }}
                      />
                      <div className="relative p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-500">{stat.label}</p>
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${stat.color}26` }}
                          >
                            <Icon
                              className="size-4"
                              style={{ color: stat.color }}
                            />
                          </div>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          <AnimatedNumber value={stat.value} />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={glassCard}>
            <CardHeader>
              <CardTitle className={cardTitle}>
                Activity Trend ({days} days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dashboard.charts.dailyTrend}>
                  <defs>
                    <linearGradient
                      id="colorInterest"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorContact"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.amber}
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.amber}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={gridStroke}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    fontSize={12}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    labelFormatter={(value) => formatDate(String(value))}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Legend formatter={legendFormatter} />
                  <Area
                    type="monotone"
                    dataKey="interestRequests"
                    name="Interest Requests"
                    stroke={COLORS.primary}
                    fill="url(#colorInterest)"
                    strokeWidth={2}
                    animationDuration={900}
                  />
                  <Area
                    type="monotone"
                    dataKey="contactQueries"
                    name="Contact Queries"
                    stroke={COLORS.amber}
                    fill="url(#colorContact)"
                    strokeWidth={2}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Block distribution + donuts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className={glassCard}>
              <CardHeader>
                <CardTitle className={cardTitle}>Products by Block</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dashboard.charts.productsByBlock}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={gridStroke}
                    />
                    <XAxis
                      dataKey="block"
                      fontSize={12}
                      tick={axisTick}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tick={axisTick}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(99,102,241,0.06)" }}
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                    />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      animationDuration={900}
                    >
                      {dashboard.charts.productsByBlock.map((_, i) => (
                        <Cell
                          key={i}
                          fill={BLOCK_COLORS[i % BLOCK_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className={glassCard}>
              <CardHeader>
                <CardTitle className={cardTitle}>Interest Status</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={interestedPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      stroke="none"
                      animationDuration={900}
                    >
                      {interestedPieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                    />
                    <Legend formatter={legendFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className={glassCard}>
              <CardHeader>
                <CardTitle className={cardTitle}>Contact Status</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={contactPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      stroke="none"
                      animationDuration={900}
                    >
                      {contactPieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CONTACT_COLORS[i % CONTACT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                    />
                    <Legend formatter={legendFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top products + recent activity */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className={glassCard}>
              <CardHeader>
                <CardTitle className={cardTitle}>
                  Top Interested Products
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {dashboard.topInterestedProducts.length === 0 && (
                  <p className={`text-sm ${mutedText}`}>No data yet</p>
                )}
                {dashboard.topInterestedProducts.map((product, i) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-xs font-medium text-indigo-700">
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-900">
                        {product.title}
                      </span>
                    </div>
                    <div className={`text-right ${mutedText}`}>
                      <p>{product.requestCount} requests</p>
                      <p className="text-xs">{product.totalQuantity} qty</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className={glassCard}>
              <CardHeader>
                <CardTitle className={cardTitle}>
                  Recent Interested Products
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {dashboard.recentInterestedProducts.length === 0 && (
                  <p className={`text-sm ${mutedText}`}>No data yet</p>
                )}
                {dashboard.recentInterestedProducts.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.productSnapshot?.title}
                      </p>
                      <p className={`text-xs ${mutedText}`}>
                        {item.userName} &middot;{" "}
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={viewedBadgeClass(item.isViewed)}
                    >
                      {item.isViewed ? "Viewed" : "New"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className={glassCard}>
              <CardHeader>
                <CardTitle className={cardTitle}>Recent Contacts</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {dashboard.recentContacts.length === 0 && (
                  <p className={`text-sm ${mutedText}`}>No data yet</p>
                )}
                {dashboard.recentContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {contact.name || contact.userName || "Unknown"}
                      </p>
                      <p className={`text-xs ${mutedText}`}>
                        {formatDateTime(contact.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={statusBadgeClass(contact.status)}
                    >
                      {contact.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
