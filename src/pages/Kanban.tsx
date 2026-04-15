import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";

const COLS = [
  { key: "new",            label: "New Leads",      color: "bg-blue-500",   light: "bg-blue-50   border-blue-200" },
  { key: "contacted",      label: "Contacted",      color: "bg-yellow-500", light: "bg-yellow-50 border-yellow-200" },
  { key: "interested",     label: "Interested",     color: "bg-green-500",  light: "bg-green-50  border-green-200" },
  { key: "not_interested", label: "Not Interested", color: "bg-red-400",    light: "bg-red-50    border-red-200" },
  { key: "admitted",       label: "Admitted",       color: "bg-purple-500", light: "bg-purple-50 border-purple-200" },
  { key: "lost",           label: "Lost",           color: "bg-gray-400",   light: "bg-gray-50   border-gray-200" },
];

export default function Kanban() {
  const [columns, setColumns] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<{ lead: any; fromCol: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/leads/kanban");
    setColumns(res);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onDragStart = (lead: any, fromCol: string) => setDragging({ lead, fromCol });
  const onDragOver  = (e: React.DragEvent, col: string) => { e.preventDefault(); setDragOver(col); };
  const onDrop      = async (toCol: string) => {
    if (!dragging || dragging.fromCol === toCol) { setDragging(null); setDragOver(null); return; }
    // Optimistic update
    setColumns(prev => {
      const from = prev[dragging.fromCol].filter(l => l.id !== dragging.lead.id);
      const to   = [{ ...dragging.lead, status: toCol }, ...(prev[toCol] || [])];
      return { ...prev, [dragging.fromCol]: from, [toCol]: to };
    });
    await api.patch(`/leads/${dragging.lead.id}`, { status: toCol });
    setDragging(null); setDragOver(null);
  };

  const total = Object.values(columns).reduce((s, arr) => s + arr.length, 0);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pipeline View</h2>
          <p className="text-sm text-gray-400">{total} total leads · drag to change stage</p>
        </div>
        <button onClick={load} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">↻ Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLS.map(col => {
            const leads = columns[col.key] || [];
            const isOver = dragOver === col.key;
            return (
              <div key={col.key}
                className={`flex-shrink-0 w-64 rounded-xl border-2 transition-all ${isOver ? "border-dashed border-gray-400 bg-gray-50" : "border-transparent"}`}
                onDragOver={e => onDragOver(e, col.key)}
                onDrop={() => onDrop(col.key)}
                onDragLeave={() => setDragOver(null)}>
                {/* Column header */}
                <div className={`${col.light} border rounded-xl px-3 py-2.5 mb-2 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <span className="text-xs font-bold text-gray-700">{col.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border">{leads.length}</span>
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-[200px]">
                  {leads.map(lead => (
                    <div key={lead.id}
                      draggable
                      onDragStart={() => onDragStart(lead, col.key)}
                      className="bg-white border rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                      <p className="font-semibold text-gray-800 text-sm truncate">{lead.fullName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{lead.countryCode} {lead.phone}</p>
                      {lead.program && <p className="text-xs text-gray-500 mt-1 truncate">{lead.program}</p>}
                      {lead.assignedAdmin && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                            {lead.assignedAdmin.name?.[0]}
                          </div>
                          <span className="text-[10px] text-gray-400">{lead.assignedAdmin.name}</span>
                        </div>
                      )}
                      {/* WhatsApp link */}
                      <a href={`https://wa.me/${lead.countryCode?.replace("+", "")}${lead.phone}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="mt-2 flex items-center gap-1 text-[10px] text-green-600 hover:text-green-700 font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div className="text-center py-8 text-gray-300 text-xs">Drop here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
