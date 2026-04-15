import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";

const STATUS_OPTS = ["new","in_progress","resolved","closed"];
const STATUS_COLOR: Record<string,string> = {
  new:         "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved:    "bg-green-100 text-green-700",
  closed:      "bg-gray-100 text-gray-600",
};

export default function ContactInquiries() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<any>(null);
  const [search, setSearch]       = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.get("/contact");
    setInquiries(Array.isArray(res) ? res : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await api.patch(`/contact/${id}`, { status });
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selected?.id === id) setSelected((s: any) => ({ ...s, status }));
  };

  const deleteInquiry = async (id: number) => {
    if (!confirm("Delete this inquiry?")) return;
    await api.del(`/contact/${id}`);
    setInquiries(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = inquiries.filter(i =>
    !search || i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase()) ||
    i.phone?.includes(search)
  );

  const fmt = (dt: string) => new Date(dt).toLocaleString("en-IN", {
    day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true
  }).toUpperCase();

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Contact Form Inquiries</h2>
          <p className="text-sm text-gray-500 mt-0.5">{inquiries.length} total inquiries</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="text-sm outline-none bg-transparent w-52" />
          </div>
          <button onClick={load} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] font-normal">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["#","Date & Time","Name","Phone","Email","Program","Message","Status","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">No inquiries found</td></tr>
              ) : filtered.map((inq, i) => (
                <tr key={inq.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(inq)}>
                  <td className="px-4 py-3 text-gray-400">{i+1}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{fmt(inq.created_at || inq.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{inq.full_name || inq.fullName}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{inq.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{inq.email}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{inq.program || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{inq.message}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLOR[inq.status] || "bg-gray-100 text-gray-600"}`}>
                      {inq.status?.replace("_"," ")}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <select value={inq.status} onChange={e => updateStatus(inq.id, e.target.value)}
                        className="border rounded-lg px-2 py-1 text-xs outline-none">
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                      </select>
                      {user.role === "super_admin" && (
                        <button onClick={() => deleteInquiry(inq.id)}
                          className="text-red-400 hover:text-red-600 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50">
                          Del
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1" />
          <div className="w-full sm:w-[420px] bg-white h-full flex flex-col shadow-2xl border-l" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-gray-800">Inquiry Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {[
                { label:"Name",    value: selected.full_name || selected.fullName },
                { label:"Phone",   value: selected.phone || "—" },
                { label:"Email",   value: selected.email },
                { label:"Program", value: selected.program || "—" },
                { label:"Date",    value: fmt(selected.created_at || selected.createdAt) },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{f.label}</p>
                  <p className="text-sm text-gray-800 font-medium">{f.value}</p>
                </div>
              ))}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{selected.message}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
                <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400">
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
