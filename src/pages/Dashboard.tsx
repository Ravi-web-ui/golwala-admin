import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, LabelList } from "recharts";

const LEVEL_COLORS = ["bg-indigo-500","bg-cyan-500","bg-teal-500","bg-orange-400","bg-pink-500"];

type DatePreset = "today"|"yesterday"|"this_month"|"next_month"|"this_year"|"custom";

function getDateRange(preset: DatePreset, custom: { from: string; to: string }) {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  switch (preset) {
    case "today":      return { from: fmt(now), to: fmt(now) };
    case "yesterday":  { const y = new Date(now); y.setDate(y.getDate()-1); return { from: fmt(y), to: fmt(y) }; }
    case "this_month": return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(new Date(now.getFullYear(), now.getMonth()+1, 0)) };
    case "next_month": return { from: fmt(new Date(now.getFullYear(), now.getMonth()+1, 1)), to: fmt(new Date(now.getFullYear(), now.getMonth()+2, 0)) };
    case "this_year":  return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
    case "custom":     return custom;
    default:           return { from: "", to: "" };
  }
}

export default function Dashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats]         = useState<any>(null);
  const [statuses, setStatuses]   = useState<any[]>([]);
  const [preset, setPreset]       = useState<DatePreset>("today");
  const [custom, setCustom]       = useState({ from:"", to:"" });
  const [loading, setLoading]     = useState(false);

  const loadStats = async (p = preset, c = custom) => {
    setLoading(true);
    const range = getDateRange(p, c);
    const q = new URLSearchParams();
    if (range.from) q.set("from", range.from);
    if (range.to)   q.set("to",   range.to);
    const res = await api.get(`/leads/meta/stats?${q.toString()}`);
    setStats(res);
    setLoading(false);
  };

  useEffect(() => {
    api.get("/statuses").then(r => { if(Array.isArray(r)) setStatuses(r); });
    loadStats();
  }, []);

  const total    = stats?.total || 0;
  const today    = stats?.today || 0;
  const byStatus: { status: string; _count: number }[] = stats?.byStatus || [];
  const byLevel:  { programLevel: string; _count: number }[] = stats?.byLevel || [];

  // Build chart data using dynamic statuses
  const chartData = byStatus.map(s => {
    const meta = statuses.find(st => st.value === s.status);
    return {
      status: meta?.label || s.status,
      value:  s.status,
      count:  s._count,
      color:  meta?.color || "#6b7280",
    };
  }).filter(d => d.count > 0);

  const totalChart = chartData.reduce((sum, d) => sum + d.count, 0);

  const PRESETS: { key: DatePreset; label: string }[] = [
    { key:"today",      label:"Today" },
    { key:"yesterday",  label:"Yesterday" },
    { key:"this_month", label:"This Month" },
    { key:"next_month", label:"Next Month" },
    { key:"this_year",  label:"This Year" },
    { key:"custom",     label:"Custom" },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Welcome back, {user.name?.split(" ")[0]} 👋</h2>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening with your leads.</p>
        </div>
        <Link to="/leads" className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-sm hover:opacity-90"
          style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
          View All Leads
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>
        </Link>
      </div>

      {/* Date filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {PRESETS.map(p => (
          <button key={p.key} onClick={() => { setPreset(p.key); if(p.key!=="custom") loadStats(p.key, custom); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${preset===p.key?"text-white border-transparent":"bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}
            style={preset===p.key?{background:"linear-gradient(135deg,#c0392b,#8e1a10)"}:{}}>
            {p.label}
          </button>
        ))}
        {preset==="custom" && (
          <div className="flex items-center gap-2">
            <input type="date" value={custom.from} onChange={e => setCustom(c => ({...c,from:e.target.value}))}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
            <span className="text-gray-400 text-xs">to</span>
            <input type="date" value={custom.to} onChange={e => setCustom(c => ({...c,to:e.target.value}))}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
            <button onClick={() => loadStats("custom", custom)}
              className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg"
              style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>Apply</button>
          </div>
        )}
        {loading && <span className="text-xs text-gray-400 animate-pulse">Loading...</span>}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Leads" value={total} icon={<PeopleIcon/>} iconBg="bg-blue-50" iconColor="text-blue-500" sub="In selected period" />
        <StatCard label="Today's Leads" value={today} icon={<TodayIcon/>} iconBg="bg-green-50" iconColor="text-green-500"
          sub={new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"})} highlight />
        <StatCard label="Admitted" value={byStatus.find(s=>s.status==="admitted")?._count||0}
          icon={<CheckIcon/>} iconBg="bg-purple-50" iconColor="text-purple-500" sub="Converted" />
        <StatCard label="New Leads" value={byStatus.find(s=>s.status==="new")?._count||0}
          icon={<StarIcon/>} iconBg="bg-orange-50" iconColor="text-orange-500" sub="Pending action" />
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-800">Lead Status</h3>
          <button onClick={() => nav("/leads")}
            className="px-4 py-1.5 text-white text-xs font-bold rounded-lg"
            style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
            View {totalChart} leads →
          </button>
        </div>

        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No data for selected period</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top:20, right:20, left:0, bottom:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize:12, fill:"#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}
                  label={{ value:"Leads Count", angle:-90, position:"insideLeft", style:{fontSize:11,fill:"#9ca3af"} }} />
                <Tooltip cursor={{ fill:"rgba(0,0,0,0.04)" }}
                  content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-xs font-semibold text-gray-700">{payload[0].payload.status}</p>
                      <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>{payload[0].value}</p>
                      <p className="text-xs text-gray-400">{totalChart>0?Math.round((Number(payload[0].value)/totalChart)*100):0}%</p>
                    </div>
                  ) : null} />
                <Bar dataKey="count" radius={[4,4,0,0]} maxBarSize={70}
                  onClick={(data) => nav(`/leads?status=${data.value}`)}>
                  <LabelList dataKey="count" position="top" style={{ fontSize:12, fontWeight:700, fill:"#374151" }} />
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} cursor="pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t flex flex-wrap gap-x-5 gap-y-1.5">
              {chartData.map(d => (
                <button key={d.value} onClick={() => nav(`/leads?status=${d.value}`)}
                  className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-gray-600 font-medium">{d.status}</span>
                  <span className="text-xs font-bold text-gray-800">{d.count}</span>
                  <span className="text-xs text-gray-400">{totalChart>0?Math.round((d.count/totalChart)*100):0}%</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Program level + quick pills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">By Program Level</h3>
          {byLevel.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data</p>
          ) : byLevel.map((l, i) => {
            const pct = total > 0 ? Math.round((l._count/total)*100) : 0;
            return (
              <div key={l.programLevel} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 font-medium capitalize">{l.programLevel||"Unknown"}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">{l._count}</span>
                    <span className="text-xs text-gray-400">{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${LEVEL_COLORS[i%LEVEL_COLORS.length]}`} style={{ width:`${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
          {chartData.map(d => (
            <Link key={d.value} to={`/leads?status=${d.value}`}
              className="bg-white rounded-xl p-4 border border-transparent hover:border-gray-200 transition-all group shadow-sm">
              <p className="text-2xl font-bold" style={{ color: d.color }}>{d.count}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium group-hover:text-gray-700">{d.status}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, icon, iconBg, iconColor, sub, highlight }: {
  label: string; value: number; icon: React.ReactNode; iconBg: string; iconColor: string; sub: string; highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4 ${highlight?"ring-1 ring-red-100":""}`}>
      <div className={`${iconBg} ${iconColor} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${highlight?"text-red-600":"text-gray-800"}`}>{value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

const PeopleIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const TodayIcon  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>;
const CheckIcon  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const StarIcon   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>;
