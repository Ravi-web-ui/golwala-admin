import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";

interface Status { id: number; label: string; value: string; color: string; stage: string; isDefault: boolean; }

const STAGE_META = {
  initial: { title: "Initial Stage",  bg: "bg-gray-50",   border: "border-gray-200", head: "text-gray-700" },
  active:  { title: "Active Stage",   bg: "bg-blue-50/40", border: "border-blue-200", head: "text-blue-700" },
  closed:  { title: "Closed Stage",   bg: "bg-green-50/40",border: "border-green-200",head: "text-green-700" },
};

const COLOR_PRESETS = [
  "#3b82f6","#22c55e","#eab308","#ef4444","#a855f7",
  "#f97316","#ec4899","#06b6d4","#6b7280","#14b8a6",
  "#8b5cf6","#f59e0b","#10b981","#6366f1","#84cc16",
];

export default function LeadStages() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "super_admin";

  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState({ text:"", type:"" });

  // Add form state
  const [newLabel, setNewLabel]   = useState("");
  const [newColor, setNewColor]   = useState("#3b82f6");
  const [newStage, setNewStage]   = useState("active");
  const [adding, setAdding]       = useState(false);

  // Edit state
  const [editId, setEditId]       = useState<number|null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.get("/statuses");
    setStatuses(Array.isArray(res) ? res : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const flash = (text: string, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text:"", type:"" }), 3000);
  };

  const addStatus = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    const res = await api.post("/statuses", { label: newLabel, color: newColor, stage: newStage }, true);
    setAdding(false);
    if (res.id) { flash("Status added"); setNewLabel(""); load(); }
    else flash(res.error || "Failed", "error");
  };

  const deleteStatus = async (id: number) => {
    if (!confirm("Delete this status?")) return;
    const res = await api.del(`/statuses/${id}`);
    if (res.message) { flash("Deleted"); load(); }
    else flash(res.error || "Cannot delete", "error");
  };

  const saveEdit = async () => {
    if (!editId) return;
    const res = await api.patch(`/statuses/${editId}`, { label: editLabel, color: editColor });
    if (res.message) { flash("Updated"); setEditId(null); load(); }
    else flash(res.error || "Failed", "error");
  };

  const byStage = (stage: string) => statuses.filter(s => s.stage === stage);

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Lead Stages</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure your sales pipeline stages and statuses</p>
      </div>

      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.type==="error"?"bg-red-50 text-red-600 border border-red-200":"bg-green-50 text-green-700 border border-green-200"}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {(["initial","active","closed"] as const).map(stage => {
            const meta = STAGE_META[stage];
            const items = byStage(stage);
            return (
              <div key={stage} className={`rounded-xl border ${meta.border} ${meta.bg} overflow-hidden`}>
                {/* Column header */}
                <div className={`px-4 py-3 border-b ${meta.border} flex items-center justify-between`}>
                  <h3 className={`font-bold text-sm ${meta.head}`}>{meta.title}</h3>
                  <span className="text-xs text-gray-400 font-medium">{items.length} statuses</span>
                </div>

                {/* Status items */}
                <div className="p-3 space-y-2 min-h-[120px]">
                  {items.map(s => (
                    <div key={s.id} className="bg-white rounded-lg border border-gray-200 px-3 py-2.5 flex items-center gap-3 shadow-sm group">
                      {/* Drag handle */}
                      <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                      </svg>

                      {editId === s.id ? (
                        /* Edit mode */
                        <div className="flex-1 flex items-center gap-2">
                          <input value={editLabel} onChange={e => setEditLabel(e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-xs outline-none focus:border-blue-400"
                            onKeyDown={e => { if(e.key==="Enter") saveEdit(); if(e.key==="Escape") setEditId(null); }} />
                          <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
                          <button onClick={saveEdit} className="text-xs px-2 py-1 bg-blue-500 text-white rounded font-semibold">✓</button>
                          <button onClick={() => setEditId(null)} className="text-xs px-2 py-1 border rounded text-gray-500">✕</button>
                        </div>
                      ) : (
                        /* View mode */
                        <>
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-sm font-medium text-gray-800 flex-1">{s.label}</span>
                          {s.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-semibold">Default</span>
                          )}
                          {isSuperAdmin && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditId(s.id); setEditLabel(s.label); setEditColor(s.color); }}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              </button>
                              {!s.isDefault && (
                                <button onClick={() => deleteStatus(s.id)}
                                  className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No statuses in this stage</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new status — super_admin only */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-lg">
          <h3 className="font-bold text-gray-800 mb-4">Add New Status</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Status Name</label>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder="e.g. Follow Up, Counselling Scheduled"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                onKeyDown={e => { if(e.key==="Enter") addStatus(); }} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Stage</label>
              <div className="flex gap-2">
                {(["initial","active","closed"] as const).map(s => (
                  <button key={s} onClick={() => setNewStage(s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all capitalize ${newStage===s?"border-red-400 bg-red-50 text-red-600":"border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Color</label>
              <div className="flex flex-wrap gap-2 items-center">
                {COLOR_PRESETS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${newColor===c?"border-gray-800 scale-110":"border-transparent hover:scale-105"}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer border border-gray-200 p-0" title="Custom color" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: newColor }} />
                <span className="text-sm font-medium text-gray-700">{newLabel || "Preview"}</span>
              </div>
              <button onClick={addStatus} disabled={adding || !newLabel.trim()}
                className="ml-auto px-5 py-2 text-white text-sm font-bold rounded-lg disabled:opacity-40 transition-opacity"
                style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
                {adding ? "Adding..." : "+ Add Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
