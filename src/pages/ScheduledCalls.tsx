import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";

export default function ScheduledCalls() {
  const [calls, setCalls]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/followups/upcoming");
    setCalls(Array.isArray(res) ? res : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const markDone = async (id: number) => {
    await api.patch(`/followups/${id}`, { status: "done" });
    load();
  };

  const fmt = (dt: string) => {
    const d = new Date(dt);
    const date = d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
    const time = d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true }).toUpperCase();
    return `${date}, ${time}`;
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Scheduled Calls</h2>
          <p className="text-sm text-gray-500 mt-0.5">{calls.length} upcoming call{calls.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={load} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-[13px] font-normal">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["#","Lead Name","Phone","Scheduled At","Note","Assigned By","Status","Action"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : calls.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">No scheduled calls</td></tr>
            ) : calls.map((f, i) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-blue-600 whitespace-nowrap">
                  {f.lead?.fullName || f.lead?.full_name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {f.lead?.countryCode || f.lead?.country_code} {f.lead?.phone}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-semibold text-orange-600">
                    {fmt(f.scheduledAt || f.scheduled_at)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{f.note || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {f.admin?.name ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {f.admin.name.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <span className="text-gray-700">{f.admin.name}</span>
                    </div>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 capitalize">
                    {f.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => markDone(f.id)}
                    className="px-3 py-1 text-xs font-semibold border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                    ✓ Done
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
