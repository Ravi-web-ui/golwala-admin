import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, LabelList } from "recharts";

const Ic = ({ d, d2 }: { d?: string; d2?: string }) => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    {d && <path d={d} />}{d2 && <path d={d2} />}
  </svg>
);
const PhoneIc  = () => <Ic d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />;
const EmailIc  = () => <Ic d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />;
const CourseIc = () => <Ic d="M12 14l9-5-9-5-9 5 9 5z" d2="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />;
const PinIc    = () => <Ic d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" d2="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />;
const TagIc    = () => <Ic d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />;
const ClipIc   = () => <Ic d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />;
const LinkIc   = () => <Ic d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />;
const CalIc    = () => <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const CallIc   = () => <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;
const ClockIc  = () => <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>;
const ChatIc   = () => <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>;
const MsgIc    = () => <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>;
const NoteIc   = () => <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>;
const WAIcon   = () => <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>;
const DotsIc   = () => <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>;
const StarIc   = () => <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
const PencilIc = () => <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;

const LEVELS = ["bachelor","master","diploma"];
const HEAR   = ["Social Media","Friend / Family","School / College","Newspaper / Magazine","Online Search","Advertisement","Other"];

export default function Leads() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "super_admin";
  const [leads, setLeads]           = useState<any[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [pages, setPages]           = useState(1);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState<any>(null);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [filters, setFilters]       = useState({ status: searchParams.get("status")||"", program_level:"", city:"", search:"", from:"", to:"", hear_about:"", assigned_to:"" });
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [newFilterName, setNewFilterName] = useState("");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [perms, setPerms]           = useState<any>({ canDeleteLeads:false, canEditLeads:true });
  const [showMore, setShowMore]     = useState(false);
  const [activeTab, setActiveTab]   = useState<"activity"|"task">("activity");
  const [noteText, setNoteText]     = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [showDots, setShowDots]     = useState(false);
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [statuses, setStatuses]     = useState<any[]>([]);
  const [admins, setAdmins]         = useState<any[]>([]);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [bulkAssignTo, setBulkAssignTo] = useState("");
  const [editField, setEditField]   = useState<string|null>(null);
  const [editVal, setEditVal]       = useState("");
  const [viewMode, setViewMode]     = useState<"table"|"chart">("table");
  const [chartFilter, setChartFilter] = useState<string|null>(null);
  const [chartLeads, setChartLeads] = useState<any[]>([]);
  const [allLeadsForChart, setAllLeadsForChart] = useState<any[]>([]);
  // Manual add lead
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ full_name:"", phone:"", email:"", city:"", program_level:"", program:"", hear_about:"", status:"new", assigned_to:"" });
  const [addingLead, setAddingLead] = useState(false);
  // Call Later / Scheduled calls
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [showCallLaterInline, setShowCallLaterInline] = useState(false);
  const [callLaterDate, setCallLaterDate] = useState("");
  const [callLaterTime, setCallLaterTime] = useState("");
  const [callLaterNote, setCallLaterNote] = useState("");
  const [scheduledCalls, setScheduledCalls] = useState<any[]>([]);
  const [showScheduled, setShowScheduled] = useState(false);

  const buildQuery = (f=filters, p=page) => {
    const q = new URLSearchParams();
    Object.entries(f).forEach(([k,v]) => { if(v) q.set(k,v); });
    q.set("page", String(p)); return q.toString();
  };

  const load = useCallback(async (f=filters, p=page) => {
    setLoading(true);
    const res = await api.get(`/leads?${buildQuery(f,p)}`);
    setLeads(res.leads||[]); setTotal(res.total||0); setPages(res.pages||1);
    setLoading(false);
  }, []);

  const loadAllForChart = async () => {
    const res = await api.get("/leads?limit=1000&page=1");
    setAllLeadsForChart(res.leads || []);
  };

  const loadAll = async () => {
    const [permsRes, statusRes, adminsRes, filtersRes] = await Promise.all([
      api.get("/admins/my-permissions"), api.get("/statuses"),
      api.get("/admins"), api.get("/filters"),
    ]);
    if (permsRes && !permsRes.error) setPerms(permsRes);
    if (Array.isArray(statusRes)) setStatuses(statusRes);
    if (Array.isArray(adminsRes)) setAdmins(adminsRes);
    if (Array.isArray(filtersRes)) setSavedFilters(filtersRes);
  };

  useEffect(() => { load(); loadAll(); loadAllForChart(); }, []);

  const loadScheduledCalls = async () => {
    const res = await api.get("/followups/upcoming");
    setScheduledCalls(Array.isArray(res) ? res : []);
  };
  useEffect(() => { loadScheduledCalls(); }, []);

  const chartData = statuses.map(s => ({
    status: s.label, value: s.value,
    count: allLeadsForChart.filter(l => l.status === s.value).length,
    color: s.color || "#6b7280",
  })).filter(d => d.count > 0);

  const totalForChart = chartData.reduce((sum, d) => sum + d.count, 0);

  const handleBarClick = (data: any) => {
    setChartFilter(data.value);
    setChartLeads(allLeadsForChart.filter(l => l.status === data.value));
  };

  const [exporting, setExporting] = useState(false);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const q = new URLSearchParams();
      Object.entries(filters).forEach(([k,v]) => { if(v) q.set(k,v); });
      q.set("limit", "10000");
      q.set("page", "1");
      const res = await api.get(`/leads?${q.toString()}`);
      const rows: any[] = res.leads || [];

      if (rows.length === 0) { alert("No leads to export"); return; }

      const headers = ["Name","Phone","Email","Status","Source","City","State","Program Level","Program","Assignee","UTM Source","UTM Campaign","UTM Medium","UTM Term","UTM Content","UTM Name","Form Source","Date"];
      const csv = [
        headers.join(","),
        ...rows.map(l => [
          l.full_name, `${l.country_code||""} ${l.phone||""}`, l.email, l.status,
          l.hear_about, l.city, l.state, l.program_level, l.program,
          l.assigned_admin?.name || "",
          l.utm_source, l.utm_campaign, l.utm_medium, l.utm_term, l.utm_content, l.utm_name,
          l.form_source,
          l.created_at ? new Date(l.created_at).toLocaleString("en-IN") : ""
        ].map(v => `"${(v||"").toString().replace(/"/g,'""')}"`).join(","))
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const openLead = (lead: any, idx: number) => {
    setSelected(lead); setSelectedIdx(idx);
    setShowMore(false); setActiveTab("activity");
    setEditField(null); setShowDots(false); setShowStatusDrop(false);
    setShowNoteBox(false); setShowCallLaterInline(false);
    api.get(`/activities/${lead.id}`).then(r => setActivities(Array.isArray(r) ? r : []));
  };
  const navLead = (dir: 1|-1) => {
    const ni = selectedIdx + dir;
    if (ni < 0 || ni >= leads.length) return;
    openLead(leads[ni], ni);
  };

  const applyFilter = (f: typeof filters, p=1) => { setFilters(f); setPage(p); load(f,p); };
  const clearFilters = () => applyFilter({ status:"", program_level:"", city:"", search:"", from:"", to:"", hear_about:"", assigned_to:"" });

  const saveFilter = async () => {
    if (!newFilterName.trim()) return;
    await api.post("/filters", { name: newFilterName, filter_config: filters }, true);
    setNewFilterName("");
    const res = await api.get("/filters");
    if (Array.isArray(res)) setSavedFilters(res);
  };
  const deleteFilter = async (id: number) => {
    await api.del(`/filters/${id}`);
    const res = await api.get("/filters");
    if (Array.isArray(res)) setSavedFilters(res);
  };

  const updateStatus = async (id: number, status: string) => {
    await api.patch(`/leads/${id}`, { status });
    load(); loadAllForChart();
    if (selected?.id === id) {
      setSelected((s: any) => ({ ...s, status }));
      // Immediately reload activities to show status change
      const r = await api.get(`/activities/${id}`);
      setActivities(Array.isArray(r) ? r : []);
    }
    setShowStatusDrop(false);
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    const res = await api.del(`/leads/${id}`);
    if (res.error) { alert(res.error); return; }
    load(); setSelected(null); setShowDots(false);
  };

  const saveEditField = async () => {
    if (!selected || !editField) return;
    await api.patch(`/leads/${selected.id}`, { [editField]: editVal });
    setSelected((s: any) => ({ ...s, [editField]: editVal }));
    setEditField(null); load();
  };

  const scheduleCallLater = async () => {
    if (!selected || !callLaterDate) return;
    // callLaterDate is now datetime-local format: "2026-04-08T14:30"
    const scheduled_at = callLaterDate;
    await api.post("/followups", { lead_id: selected.id, scheduled_at, note: callLaterNote }, true);
    setShowCallLaterInline(false);
    setCallLaterDate(""); setCallLaterTime(""); setCallLaterNote("");
    await loadScheduledCalls();
    const r = await api.get(`/activities/${selected.id}`);
    setActivities(Array.isArray(r) ? r : []);
  };

  const addManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.full_name || !newLead.phone) return;
    setAddingLead(true);
    const res = await api.post("/leads/manual", {
      ...newLead,
      assigned_to: newLead.assigned_to ? parseInt(newLead.assigned_to) : null,
    }, true);
    setAddingLead(false);
    if (res.id || res.message) {
      setShowAddLead(false);
      setNewLead({ full_name:"", phone:"", email:"", city:"", program_level:"", program:"", hear_about:"", status:"new", assigned_to:"" });
      load(); loadAllForChart();
    }
  };

  const addNote = async () => {
    if (!noteText.trim() || !selected) return;
    setSavingNote(true);
    await api.post(`/activities/${selected.id}`, { type:"note", note: noteText }, true);
    setNoteText("");
    const r = await api.get(`/activities/${selected.id}`);
    setActivities(Array.isArray(r) ? r : []);
    setSavingNote(false);
  };

  const toggleCheck = (id: number) => {
    setCheckedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (checkedIds.size === leads.length) setCheckedIds(new Set());
    else setCheckedIds(new Set(leads.map(l => l.id)));
  };
  const bulkDelete = async () => {
    if (!confirm(`Delete ${checkedIds.size} leads?`)) return;
    await Promise.all([...checkedIds].map(id => api.del(`/leads/${id}`)));
    setCheckedIds(new Set()); load();
  };
  const bulkAssign = async () => {
    if (!bulkAssignTo) return;
    await Promise.all([...checkedIds].map(id => api.patch(`/leads/${id}`, { assigned_to: parseInt(bulkAssignTo) })));
    setCheckedIds(new Set()); setShowBulkAssign(false); load();
  };
  const bulkUpdateStatus = async (status: string) => {
    await Promise.all([...checkedIds].map(id => api.patch(`/leads/${id}`, { status })));
    setCheckedIds(new Set()); load();
  };

  const getStatusMeta = (val: string) => statuses.find(s => s.value === val) || { label: val, color:"#6b7280" };

  const StatusBadge = ({ value }: { value: string }) => {
    const s = getStatusMeta(value);
    const hex = s.color || "#6b7280";
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap"
        style={{ backgroundColor: hex+"20", color: hex, border:`1px solid ${hex}40` }}>
        {s.label}
      </span>
    );
  };

  const EditableField = ({ field, value, label, icon, tag, tagBg }: {
    field: string; value: string|null; label: string; icon: React.ReactNode; tag?: boolean; tagBg?: string;
  }) => {
    const isEditing = editField === field;
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-gray-400">{icon}</span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        </div>
        {isEditing ? (
          <div className="flex gap-1">
            <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter") saveEditField(); if(e.key==="Escape") setEditField(null); }}
              className="flex-1 border border-blue-400 rounded px-2 py-1 text-sm outline-none" />
            <button onClick={saveEditField} className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-semibold">✓</button>
            <button onClick={() => setEditField(null)} className="px-2 py-1 border rounded text-xs text-gray-500">✕</button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => { setEditField(field); setEditVal(value||""); }}>
            {tag && value
              ? <span className={`inline-block px-2.5 py-0.5 rounded border text-xs font-medium ${tagBg}`}>{value}</span>
              : <span className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300 italic">—</span>}</span>
            }
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"><PencilIc/></span>
          </div>
        )}
      </div>
    );
  };

  const utmBadge = (val: string|null) => val
    ? <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded text-xs font-medium">{val}</span>
    : <span className="text-gray-300 text-xs">—</span>;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">All Leads</h2>
          <p className="text-sm text-gray-500">{total} total leads</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Scheduled calls bell */}
          <div className="relative">
            <button onClick={() => nav("/scheduled-calls")} title="Scheduled Calls"
              className="relative p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              {scheduledCalls.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {scheduledCalls.length > 9 ? "9+" : scheduledCalls.length}
                </span>
              )}
            </button>
          </div>
          {/* Add Lead */}
          {/* Import */}
          {/* Table/Chart toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => { setViewMode("table"); setChartFilter(null); }} title="Table view"
              className={`px-3 py-2 transition-colors ${viewMode==="table"?"bg-gray-800 text-white":"bg-white text-gray-500 hover:bg-gray-50"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
            </button>
            <button onClick={() => { setViewMode("chart"); setChartFilter(null); loadAllForChart(); }} title="Chart view"
              className={`px-3 py-2 border-l border-gray-200 transition-colors ${viewMode==="chart"?"bg-gray-800 text-white":"bg-white text-gray-500 hover:bg-gray-50"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </button>
          </div>
          {/* Refresh */}
          <button onClick={() => { load(); loadAllForChart(); }} title="Refresh"
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          {/* Clear filters — only show when filters active */}
          {Object.values(filters).some(v => v !== "") && (
            <button onClick={clearFilters} title="Clear all filters"
              className="flex items-center gap-1.5 px-3 py-2 border border-orange-200 bg-orange-50 rounded-lg text-xs font-semibold text-orange-600 hover:bg-orange-100 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              Clear Filters
            </button>
          )}
          <button onClick={exportCsv} disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            {exporting ? "Exporting..." : "Export"}
          </button>
          <button onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFiltersPanel?"bg-gray-100 border-gray-300":"hover:bg-gray-50"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M3 4h18M7 8h10M11 12h2M13 16h-2"/></svg>
            Filters
          </button>
        </div>
      </div>

      {/* Saved filter chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={clearFilters} className="px-3 py-1.5 bg-gray-800 text-white rounded-full text-xs font-medium">All Leads</button>
        {savedFilters.map(f => {
          const applyConditionFilter = () => {
            try {
              const cfg = typeof f.filterConfig === "string" ? JSON.parse(f.filterConfig) : f.filterConfig;
              const conditions = Array.isArray(cfg) ? cfg : (cfg.conditions || []);
              const newF = { status:"", program_level:"", city:"", search:"", from:"", to:"", hear_about:"", assigned_to:"" };
              conditions.forEach((c: any) => {
                if (c.field === "status") newF.status = c.value;
                if (c.field === "program") newF.search = c.value;
                if (c.field === "program_level") newF.program_level = c.value;
                if (c.field === "hear_about") newF.hear_about = c.value;
                if (c.field === "city") newF.city = c.value;
                if (c.field === "assigned_to") newF.assigned_to = c.value;
              });
              applyFilter(newF, 1);
            } catch { applyFilter({} as any, 1); }
          };
          return (
            <div key={f.id} className="flex items-center gap-1 bg-white border rounded-full px-3 py-1.5">
              <button onClick={applyConditionFilter} className="text-xs font-medium text-gray-700 hover:text-primary">⚗ {f.name}</button>
              <button onClick={() => nav(`/filters/${f.id}/edit`)} className="text-gray-300 hover:text-blue-400 text-xs ml-0.5" title="Edit">✎</button>
              <button onClick={() => deleteFilter(f.id)} className="text-gray-300 hover:text-red-400 text-xs ml-0.5">✕</button>
            </div>
          );
        })}
        <button onClick={() => nav("/filters/new")}
          className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-gray-300 rounded-full text-xs font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
          + New Filter
        </button>
      </div>

      {/* Filter panel */}
      {showFiltersPanel && (
        <div className="bg-white border rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Search name/email/phone" value={filters.search} onChange={e => setFilters({...filters,search:e.target.value})}
              className="border rounded-lg px-3 py-1.5 text-sm outline-none col-span-2" />
            <select value={filters.status} onChange={e => setFilters({...filters,status:e.target.value})} className="border rounded-lg px-3 py-1.5 text-sm outline-none">
              <option value="">All Status</option>
              {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={filters.program_level} onChange={e => setFilters({...filters,program_level:e.target.value})} className="border rounded-lg px-3 py-1.5 text-sm outline-none">
              <option value="">All Levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input placeholder="City" value={filters.city} onChange={e => setFilters({...filters,city:e.target.value})} className="border rounded-lg px-3 py-1.5 text-sm outline-none" />
            <select value={filters.hear_about} onChange={e => setFilters({...filters,hear_about:e.target.value})} className="border rounded-lg px-3 py-1.5 text-sm outline-none">
              <option value="">All Sources</option>
              {HEAR.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <select value={filters.assigned_to} onChange={e => setFilters({...filters,assigned_to:e.target.value})} className="border rounded-lg px-3 py-1.5 text-sm outline-none">
              <option value="">All Assignees</option>
              {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input type="date" value={filters.from} onChange={e => setFilters({...filters,from:e.target.value})} className="border rounded-lg px-3 py-1.5 text-sm outline-none" />
            <input type="date" value={filters.to} onChange={e => setFilters({...filters,to:e.target.value})} className="border rounded-lg px-3 py-1.5 text-sm outline-none" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => applyFilter(filters,1)} className="px-4 py-1.5 text-white rounded-lg text-sm font-semibold" style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>Apply</button>
            <button onClick={clearFilters} className="border px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Clear</button>
            <div className="flex-1" />
            <input value={newFilterName} onChange={e => setNewFilterName(e.target.value)} placeholder="Save as filter..."
              className="border rounded-lg px-3 py-1.5 text-sm outline-none w-44" />
            <button onClick={saveFilter} disabled={!newFilterName.trim()}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40">Save</button>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {checkedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-blue-700">{checkedIds.size} selected</span>
          <button onClick={() => setShowBulkAssign(!showBulkAssign)}
            className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50">Assign To</button>
          {showBulkAssign && (
            <div className="flex items-center gap-2">
              <select value={bulkAssignTo} onChange={e => setBulkAssignTo(e.target.value)} className="border rounded-lg px-2 py-1.5 text-xs outline-none">
                <option value="">Select admin</option>
                {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <button onClick={bulkAssign} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">Assign</button>
            </div>
          )}
          <select onChange={e => { if(e.target.value) bulkUpdateStatus(e.target.value); e.target.value=""; }}
            className="border rounded-lg px-2 py-1.5 text-xs outline-none" defaultValue="">
            <option value="">Change Status</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {perms.canDeleteLeads && (
            <button onClick={bulkDelete} className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
          )}
          <button onClick={() => setCheckedIds(new Set())} className="ml-auto text-gray-400 hover:text-gray-600 text-xs">✕ Clear</button>
        </div>
      )}

      {/* ── CHART VIEW ── */}
      {viewMode === "chart" && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-800">Lead Status</h3>
              {chartFilter && (
                <button onClick={() => setChartFilter(null)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200">
                  ✕ Clear filter
                </button>
              )}
            </div>
            <button
              onClick={() => { setViewMode("table"); if(chartFilter) { applyFilter({...filters, status: chartFilter}, 1); } }}
              className="px-4 py-1.5 text-white text-xs font-bold rounded-lg"
              style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              View {chartFilter ? chartLeads.length : totalForChart} leads →
            </button>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartFilter ? chartData.filter(d => d.value === chartFilter) : chartData}
              margin={{ top: 25, right: 20, left: 0, bottom: 20 }}
              onClick={(data) => { if(data?.activePayload?.[0]) handleBarClick(data.activePayload[0].payload); }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 12, fill:"#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill:"#9ca3af" }} axisLine={false} tickLine={false}
                label={{ value:"Leads Count", angle:-90, position:"insideLeft", style:{fontSize:11, fill:"#9ca3af"} }} />
              <Tooltip cursor={{ fill:"rgba(0,0,0,0.04)" }}
                content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-xs font-semibold text-gray-700">{payload[0].payload.status}</p>
                    <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>{payload[0].value}</p>
                    <p className="text-xs text-gray-400">{totalForChart > 0 ? Math.round((Number(payload[0].value)/totalForChart)*100) : 0}%</p>
                  </div>
                ) : null} />
              <Bar dataKey="count" radius={[4,4,0,0]} cursor="pointer" maxBarSize={80}>
                <LabelList dataKey="count" position="top" style={{ fontSize:12, fontWeight:700, fill:"#374151" }} />
                {(chartFilter ? chartData.filter(d => d.value === chartFilter) : chartData).map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={chartFilter && entry.value !== chartFilter ? 0.3 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-6 gap-y-2">
            {chartData.map(d => (
              <button key={d.value} onClick={() => handleBarClick(d)}
                className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${chartFilter === d.value ? "opacity-100" : chartFilter ? "opacity-40" : "opacity-100"}`}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-gray-600 font-medium">{d.status}</span>
                <span className="text-xs font-bold text-gray-800">{d.count}</span>
                <span className="text-xs text-gray-400">{totalForChart > 0 ? Math.round((d.count/totalForChart)*100) : 0}%</span>
              </button>
            ))}
          </div>

          {/* Clicked status mini table */}
          {chartFilter && chartLeads.length > 0 && (
            <div className="mt-6 border-t pt-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700 text-sm">
                  {getStatusMeta(chartFilter).label} — {chartLeads.length} leads
                </h4>
                <button onClick={() => { setViewMode("table"); applyFilter({...filters, status: chartFilter}, 1); }}
                  className="text-xs text-blue-600 font-semibold hover:underline">Open in table →</button>
              </div>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Name","Phone","Email","City","Program","Date"].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {chartLeads.slice(0,10).map((lead, i) => (
                      <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => { setViewMode("table"); openLead(lead, i); }}>
                        <td className="px-4 py-2.5 font-medium text-blue-600 whitespace-nowrap">{lead.full_name}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs whitespace-nowrap">{lead.country_code} {lead.phone}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs">{lead.email}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs">{lead.city||"—"}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs max-w-[160px] truncate">{lead.program||"—"}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-IN") : "—"}
                        </td>
                      </tr>
                    ))}
                    {chartLeads.length > 10 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-2.5 text-center text-xs text-blue-600 font-medium cursor-pointer hover:bg-gray-50"
                          onClick={() => { setViewMode("table"); applyFilter({...filters, status: chartFilter}, 1); }}>
                          + {chartLeads.length - 10} more — View all in table
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] font-normal">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={checkedIds.size === leads.length && leads.length > 0}
                      onChange={toggleAll} className="w-4 h-4 rounded border-gray-300 accent-red-500 cursor-pointer" />
                  </th>
                  {["Date & Time","Name","Phone","Email","Status","Assignee","Course","City","State","UTM Name","UTM Source","Campaign","UTM Medium","UTM Term","UTM Content","Form Source","Source"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={18} className="text-center py-10 text-gray-400">Loading...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={18} className="text-center py-10 text-gray-400">No leads found</td></tr>
                ) : leads.map((lead,i) => (
                  <tr key={lead.id} className={`hover:bg-gray-50 cursor-pointer ${selected?.id===lead.id?"bg-blue-50/30":""} ${checkedIds.has(lead.id)?"bg-blue-50/20":""}`}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={checkedIds.has(lead.id)} onChange={() => toggleCheck(lead.id)}
                        className="w-4 h-4 rounded border-gray-300 accent-red-500 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => openLead(lead,i)}>
                      <span className="text-xs font-medium text-gray-700">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-1.5">
                        {lead.created_at ? new Date(lead.created_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap max-w-[140px] truncate" style={{color:"#222"}} onClick={() => openLead(lead,i)}>{lead.full_name||"—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs" onClick={() => openLead(lead,i)}>{lead.country_code} {lead.phone}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap max-w-[160px] truncate" onClick={() => openLead(lead,i)}>{lead.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => openLead(lead,i)}><StatusBadge value={lead.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => openLead(lead,i)}>
                      {lead.assigned_admin?.name ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {lead.assigned_admin.name.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-700 whitespace-nowrap">{lead.assigned_admin.name}</span>
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap max-w-[160px] truncate" onClick={() => openLead(lead,i)}>{lead.program||"—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap" onClick={() => openLead(lead,i)}>{lead.city||"—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap" onClick={() => openLead(lead,i)}>{lead.state||"—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => openLead(lead,i)}>{utmBadge(lead.utm_name)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => openLead(lead,i)}>{utmBadge(lead.utm_source)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => openLead(lead,i)}>{utmBadge(lead.utm_campaign)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => openLead(lead,i)}>{utmBadge(lead.utm_medium)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => openLead(lead,i)}>{utmBadge(lead.utm_term)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={() => openLead(lead,i)}>{utmBadge(lead.utm_content)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap max-w-[160px] truncate" onClick={() => openLead(lead,i)}>{lead.form_source||"—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap" onClick={() => openLead(lead,i)}>{lead.hear_about||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <p className="text-sm text-gray-500">{total} leads · Page {page} of {pages}</p>
              <div className="flex items-center gap-1">
                <button disabled={page===1} onClick={() => { setPage(1); load(filters,1); }}
                  className="px-2 py-1.5 border rounded-lg text-xs font-medium disabled:opacity-30 hover:bg-white transition-colors">«</button>
                <button disabled={page===1} onClick={() => { setPage(page-1); load(filters,page-1); }}
                  className="px-3 py-1.5 border rounded-lg text-xs font-medium disabled:opacity-30 hover:bg-white transition-colors">‹</button>

                {(() => {
                  const pageNums: (number|string)[] = [];
                  if (pages <= 7) {
                    for (let i=1; i<=pages; i++) pageNums.push(i);
                  } else {
                    pageNums.push(1);
                    if (page > 3) pageNums.push("...");
                    for (let i=Math.max(2,page-1); i<=Math.min(pages-1,page+1); i++) pageNums.push(i);
                    if (page < pages-2) pageNums.push("...");
                    pageNums.push(pages);
                  }
                  return pageNums.map((p, i) =>
                    p === "..." ? (
                      <span key={`dot-${i}`} className="px-2 py-1.5 text-xs text-gray-400">…</span>
                    ) : (
                      <button key={p} onClick={() => { setPage(p as number); load(filters, p as number); }}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${page===p?"bg-gray-800 text-white border-gray-800":"hover:bg-white text-gray-600"}`}>
                        {p}
                      </button>
                    )
                  );
                })()}

                <button disabled={page===pages} onClick={() => { setPage(page+1); load(filters,page+1); }}
                  className="px-3 py-1.5 border rounded-lg text-xs font-medium disabled:opacity-30 hover:bg-white transition-colors">›</button>
                <button disabled={page===pages} onClick={() => { setPage(pages); load(filters,pages); }}
                  className="px-2 py-1.5 border rounded-lg text-xs font-medium disabled:opacity-30 hover:bg-white transition-colors">»</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Lead Drawer ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1" />
          <div className="w-full sm:w-1/2 bg-white h-full flex flex-col shadow-2xl border-l text-[13px] font-normal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b bg-white shrink-0">
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <div className="flex items-center gap-2">
                <button disabled={selectedIdx<=0} onClick={() => navLead(-1)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>Prev
                </button>
                <button disabled={selectedIdx>=leads.length-1} onClick={() => navLead(1)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  Next<svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 pt-5 pb-4 border-b">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{selected.full_name}</h2>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <div className="relative">
                      <button onClick={() => setShowDots(!showDots)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-colors">
                        <DotsIc/>
                      </button>
                      {showDots && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowDots(false)} />
                          <div className="absolute right-0 top-9 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-44 py-1">
                            {perms.canDeleteLeads && (
                              <button onClick={() => deleteLead(selected.id)}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium">
                                🗑 Delete Lead
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {selected.assigned_admin?.name?.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase() || "?"}
                    </div>
                    <span className="text-xs font-medium text-gray-500 hidden sm:block">{selected.assigned_admin?.name || "Unassigned"}</span>
                  </div>
                </div>
                <div className="relative inline-block">
                  <button onClick={() => setShowStatusDrop(!showStatusDrop)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor:(getStatusMeta(selected.status).color||"#6b7280")+"20", color:getStatusMeta(selected.status).color||"#6b7280", border:`1px solid ${(getStatusMeta(selected.status).color||"#6b7280")}40` }}>
                    {getStatusMeta(selected.status).label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {showStatusDrop && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowStatusDrop(false)} />
                      <div className="absolute left-0 top-9 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-52 py-2">
                        {statuses.map(s => (
                          <button key={s.value} onClick={() => updateStatus(selected.id, s.value)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color||"#6b7280" }} />
                            <span className={`font-medium flex-1 ${selected.status===s.value?"text-blue-600":"text-gray-800"}`}>{s.label}</span>
                            {selected.status===s.value && <span className="text-blue-500 text-sm">✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <EditableField field="phone" value={selected.phone} label="Phone" icon={<PhoneIc/>} />
                  <EditableField field="email" value={selected.email} label="Email" icon={<EmailIc/>} />
                  <EditableField field="alternate_phone" value={selected.alternate_phone} label="Alternate Phone" icon={<PhoneIc/>} />
                  <EditableField field="program" value={selected.program} label="Course" icon={<CourseIc/>} tag tagBg="border-amber-200 bg-amber-50 text-amber-800" />
                  <EditableField field="city" value={selected.city} label="City" icon={<PinIc/>} />
                  <EditableField field="state" value={selected.state} label="State" icon={<PinIc/>} tag tagBg="border-yellow-200 bg-yellow-50 text-yellow-800" />
                  <EditableField field="program_level" value={selected.program_level ? selected.program_level.charAt(0).toUpperCase() + selected.program_level.slice(1) : null} label="Program Level" icon={<ClipIc/>} />
                  <EditableField field="hear_about" value={selected.hear_about} label="Lead Source" icon={<TagIc/>} tag tagBg="border-green-200 bg-green-50 text-green-700" />
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                  <button onClick={() => setShowMore(!showMore)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm whitespace-nowrap">
                    {showMore
                      ? <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>Show less</>
                      : <>Show more<svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg></>
                    }
                  </button>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>

                {showMore && (
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    {[
                      { field:"utm_source",   label:"Campaign Source", icon:<TagIc/>,  tag:true,  tagBg:"border-violet-200 bg-violet-50 text-violet-700" },
                      { field:"utm_campaign", label:"Campaign Name",   icon:<TagIc/>,  tag:true,  tagBg:"border-violet-200 bg-violet-50 text-violet-700" },
                      { field:"utm_medium",   label:"Campaign Medium", icon:<LinkIc/>, tag:false },
                      { field:"utm_term",     label:"Campaign Term",   icon:<LinkIc/>, tag:false },
                      { field:"utm_content",  label:"UTM Content",     icon:<LinkIc/>, tag:false },
                      { field:"utm_name",     label:"UTM Name",        icon:<LinkIc/>, tag:false },
                    ].map(f => (
                      <EditableField key={f.field} field={f.field} value={(selected as any)[f.field]} label={f.label} icon={f.icon} tag={f.tag} tagBg={f.tagBg} />
                    ))}
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-1.5 mb-1.5"><LinkIc/><span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Form Source URL</span></div>
                      <p className="text-xs text-gray-500 break-all">{selected.form_source || "—"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-1.5 mb-1.5"><CalIc/><span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Submitted</span></div>
                      <p className="text-sm text-gray-700">{selected.created_at ? new Date(selected.created_at).toLocaleString("en-IN") : "—"}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-b bg-gray-50 px-6 py-3 flex items-center justify-around shrink-0">
                {[
                  { icon:<CallIc/>,  label:"CALL",      active:false, fn:() => window.open(`tel:${selected.country_code}${selected.phone}`) },
                  { icon:<ClockIc/>, label:"CALL LATER", active:showCallLaterInline, fn:() => { setShowCallLaterInline(!showCallLaterInline); setShowNoteBox(false); } },
                  { icon:<WAIcon/>,  label:"WHATSAPP",   active:false, fn:() => window.open(`https://wa.me/${selected.country_code?.replace("+","")}${selected.phone}`) },
                  { icon:<NoteIc/>,  label:"ADD NOTE",   active:showNoteBox, fn:() => { setShowNoteBox(!showNoteBox); setShowCallLaterInline(false); setActiveTab("activity"); } },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.fn}
                    className={`flex flex-col items-center gap-1.5 transition-colors group ${btn.active?"text-indigo-600":"text-gray-500 hover:text-gray-900"}`}>
                    <span className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-sm transition-all ${btn.active?"border-indigo-300 bg-indigo-50":"border-gray-200 group-hover:border-gray-400 bg-white"}`}>
                      {btn.icon}
                    </span>
                    <span className={`text-[10px] font-bold tracking-wider ${btn.active?"text-indigo-600":""}`}>{btn.label}</span>
                  </button>
                ))}
              </div>

              {/* Inline Call Later */}
              {showCallLaterInline && (
                <div className="px-6 py-4 border-b bg-indigo-50/40">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Create Followup for: <span className="text-indigo-600">{selected.full_name}</span></p>
                  <div className="mb-3">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Date & Time *</label>
                    <input type="datetime-local"
                      value={callLaterDate}
                      onChange={e => setCallLaterDate(e.target.value)}
                      min={new Date().toISOString().slice(0,16)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white" />
                  </div>
                  <input value={callLaterNote} onChange={e => setCallLaterNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white mb-3" />
                  <div className="flex gap-2">
                    <button onClick={scheduleCallLater} disabled={!callLaterDate}
                      className="flex-1 py-2 text-white rounded-lg text-sm font-bold disabled:opacity-40"
                      style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                      Save
                    </button>
                    <button onClick={() => setShowCallLaterInline(false)}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </div>
                </div>
              )}

              <div className="px-6 pt-5 pb-6">
                <div className="flex items-center border-b mb-5">
                  {(["activity","task"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${activeTab===tab?"border-blue-600 text-blue-600":"border-transparent text-gray-400 hover:text-gray-700"}`}>
                      {tab === "activity" ? "Activity History" : "Task"}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button className="mb-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:border-gray-400 hover:bg-gray-50 flex items-center gap-1 transition-colors">
                    + Action <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                  </button>
                </div>
                {activeTab === "activity" && (
                  <div>
                    {/* Note box - hidden by default, shown on ADD NOTE click */}
                    {showNoteBox && (
                      <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                          placeholder="Add a note..." rows={3} autoFocus
                          className="w-full px-4 py-3 text-sm outline-none resize-none text-gray-700 placeholder:text-gray-400 bg-white" />
                        <div className="flex justify-end px-4 py-2.5 bg-gray-50 border-t gap-2">
                          <button onClick={() => { setShowNoteBox(false); setNoteText(""); }}
                            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                          <button onClick={async () => { await addNote(); setShowNoteBox(false); }} disabled={savingNote||!noteText.trim()}
                            className="px-5 py-1.5 text-xs font-bold text-white rounded-lg disabled:opacity-40 shadow-sm"
                            style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
                            {savingNote ? "Saving..." : "Save Note"}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      {/* Lead created */}
                      <div className="flex items-start gap-3 py-3 px-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <button className="mt-0.5 shrink-0 text-gray-300 hover:text-yellow-400 transition-colors"><StarIc/></button>
                        <span className="text-sm shrink-0">✨</span>
                        <p className="text-xs text-gray-600 flex-1 leading-relaxed">
                          Lead created — {selected.full_name} | {selected.phone} | {selected.email}{selected.program ? ` | ${selected.program}` : ""}
                        </p>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 ml-2">
                          {selected.created_at ? new Date(selected.created_at).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).toUpperCase() : ""}
                        </span>
                      </div>
                      {activities.map((a: any) => {
                        const isStatus = a.type === "status_change";
                        const isFollowUp = a.type === "follow_up";
                        const adminName = a.admin?.name || "";
                        const initials = adminName.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase();
                        // Parse status change text for bold formatting
                        const statusMatch = isStatus && a.note?.match(/from (.+) → (.+)/);
                        return (
                          <div key={a.id} className="flex items-start gap-3 py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <button className="mt-0.5 shrink-0 text-gray-300 hover:text-yellow-400 transition-colors"><StarIc/></button>
                            {isStatus ? (
                              <span className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                              </span>
                            ) : isFollowUp ? (
                              <span className="w-5 h-5 rounded bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                              </span>
                            ) : (
                              <span className="text-sm shrink-0">{a.type==="note"?"📝":a.type==="call"?"📞":"📌"}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              {isStatus && statusMatch ? (
                                <p className="text-xs leading-relaxed text-gray-700">
                                  Status changed from <span className="font-semibold text-gray-800">{statusMatch[1]}</span> → <span className="font-semibold text-gray-800">{statusMatch[2]}</span>
                                </p>
                              ) : (
                                <p className={`text-xs leading-relaxed ${isFollowUp?"text-orange-600 font-medium":"text-gray-600"}`}>
                                  {a.note || a.type}
                                </p>
                              )}
                              {adminName && (
                                <p className="text-[11px] text-gray-400 mt-0.5">by {adminName}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                {a.created_at ? new Date(a.created_at).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}).toUpperCase() : ""}
                              </span>
                              {initials && (
                                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                  {initials}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {activities.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No activity yet</p>}
                    </div>
                  </div>
                )}
                {activeTab === "task" && <p className="text-xs text-gray-400 text-center py-10">No tasks yet</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Manual Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Add Lead Manually</h3>
              <button onClick={() => setShowAddLead(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={addManualLead} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Full Name *</label>
                  <input required value={newLead.full_name} onChange={e => setNewLead({...newLead, full_name:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Phone *</label>
                  <input required value={newLead.phone} onChange={e => setNewLead({...newLead, phone:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Email</label>
                  <input type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">City</label>
                  <input value={newLead.city} onChange={e => setNewLead({...newLead, city:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Program Level</label>
                  <select value={newLead.program_level} onChange={e => setNewLead({...newLead, program_level:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="">Select...</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Program</label>
                  <input value={newLead.program} onChange={e => setNewLead({...newLead, program:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Lead Source</label>
                  <select value={newLead.hear_about} onChange={e => setNewLead({...newLead, hear_about:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="">Select...</option>
                    {HEAR.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Status</label>
                  <select value={newLead.status} onChange={e => setNewLead({...newLead, status:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                    {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Assign To</label>
                  <select value={newLead.assigned_to} onChange={e => setNewLead({...newLead, assigned_to:e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="">— Unassigned —</option>
                    {admins.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role?.replace("_"," ")})</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addingLead}
                  className="flex-1 py-2.5 text-white rounded-lg text-sm font-bold disabled:opacity-40"
                  style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
                  {addingLead ? "Adding..." : "Add Lead"}
                </button>
                <button type="button" onClick={() => setShowAddLead(false)}
                  className="px-5 py-2.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
