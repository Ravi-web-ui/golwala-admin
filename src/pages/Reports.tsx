import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";

export default function Reports() {
  const [data, setData]         = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [assigneeFilter, setAssigneeFilter] = useState("");

  useEffect(() => {
    api.get("/reports/agent-performance").then(res => {
      const list = Array.isArray(res) ? res : [];
      setData(list); setFiltered(list); setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!assigneeFilter) setFiltered(data);
    else setFiltered(data.filter(a => String(a.id) === assigneeFilter));
  }, [assigneeFilter, data]);

  const roleBadge = (role: string) => {
    const cls = role === "super_admin" ? "bg-purple-100 text-purple-600"
      : role === "manager" ? "bg-orange-100 text-orange-600"
      : "bg-blue-100 text-blue-600";
    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cls}`}>{role?.replace("_"," ")}</span>;
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Agent Performance Reports</h2>
          <p className="text-sm text-gray-400">Conversion rates, follow-ups, call stats per agent</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Assignee filter */}
          <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 bg-white min-w-[160px]">
            <option value="">All Agents</option>
            {data.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(agent => (
            <div key={agent.id} className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
                    {agent.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{agent.name}</p>
                    {roleBadge(agent.role)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-gray-800">{agent.conversionRate}%</p>
                  <p className="text-xs text-gray-400">Conversion Rate</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label:"Total Leads",    value:agent.totalLeads,    color:"text-gray-800" },
                  { label:"Calls Made",     value:agent.callsMade,     color:"text-blue-600" },
                  { label:"Calls Answered", value:agent.callsAnswered, color:"text-green-600" },
                  { label:"Follow-ups Done",value:agent.followUpsDone, color:"text-purple-600" },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {Object.keys(agent.byStatus || {}).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(agent.byStatus).map(([status, count]) => (
                    <span key={status} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {status}: {count as number}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-10 text-gray-400">No data yet</p>}
        </div>
      )}
    </Layout>
  );
}
