import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";

const FIELDS = [
  { key:"status",        label:"Status" },
  { key:"program",       label:"Program" },
  { key:"program_level", label:"Program Level" },
  { key:"hear_about",    label:"Lead Source" },
  { key:"city",          label:"City" },
  { key:"state",         label:"State" },
  { key:"assigned_to",   label:"Assignee" },
];

const OPS = [
  { key:"equals",     label:"equals" },
  { key:"contains",   label:"contains" },
  { key:"not_equals", label:"not equals" },
];

interface Condition { field: string; op: string; value: string; }

export default function FilterBuilder() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [name, setName]             = useState("");
  const [isShared, setIsShared]     = useState(false);
  const [conditions, setConditions] = useState<Condition[]>([{ field:"status", op:"equals", value:"" }]);
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState("");

  // Dynamic option lists
  const [statuses, setStatuses]     = useState<any[]>([]);
  const [admins, setAdmins]         = useState<any[]>([]);
  const [programs, setPrograms]     = useState<string[]>([]);
  const [cities, setCities]         = useState<string[]>([]);
  const [states, setStates]         = useState<string[]>([]);

  const PROGRAM_LEVELS = ["bachelor","master","diploma"];
  const HEAR_ABOUT     = ["Social Media","Friend / Family","School / College","Newspaper / Magazine","Online Search","Advertisement","Other"];

  useEffect(() => {
    Promise.all([
      api.get("/statuses"),
      api.get("/admins"),
      api.get("/leads/meta/distinct"),
    ]).then(([s, a, d]) => {
      if (Array.isArray(s)) setStatuses(s);
      if (Array.isArray(a)) setAdmins(a);
      if (d && !d.error) {
        setPrograms(d.programs || []);
        setCities(d.cities || []);
        setStates(d.states || []);
      }
    });

    if (isEdit) {
      api.get("/filters").then(r => {
        const f = Array.isArray(r) ? r.find((x: any) => x.id === parseInt(id!)) : null;
        if (f) {
          setName(f.name);
          setIsShared(f.isShared || false);
          try {
            const cfg = typeof f.filterConfig === "string" ? JSON.parse(f.filterConfig) : f.filterConfig;
            if (Array.isArray(cfg)) setConditions(cfg);
            else if (cfg.conditions) setConditions(cfg.conditions);
          } catch {}
        }
      });
    }
  }, []);

  const addCondition = () => setConditions(c => [...c, { field:"status", op:"equals", value:"" }]);
  const removeCondition = (i: number) => setConditions(c => c.filter((_,j) => j !== i));
  const updateCondition = (i: number, key: keyof Condition, val: string) => {
    setConditions(c => c.map((cond, j) => j === i ? { ...cond, [key]: val, ...(key==="field" ? {value:""} : {}) } : cond));
  };

  // Get dropdown options for a field
  const getOptions = (field: string): { value: string; label: string }[] => {
    switch (field) {
      case "status":        return statuses.map(s => ({ value: s.value, label: s.label }));
      case "program":       return programs.map(p => ({ value: p, label: p }));
      case "program_level": return PROGRAM_LEVELS.map(l => ({ value: l, label: l.charAt(0).toUpperCase()+l.slice(1) }));
      case "hear_about":    return HEAR_ABOUT.map(h => ({ value: h, label: h }));
      case "city":          return cities.map(c => ({ value: c, label: c }));
      case "state":         return states.map(s => ({ value: s, label: s }));
      case "assigned_to":   return admins.map(a => ({ value: String(a.id), label: a.name }));
      default:              return [];
    }
  };

  const save = async () => {
    if (!name.trim()) { setMsg("Filter name required"); return; }
    if (conditions.some(c => !c.value)) { setMsg("All conditions must have a value"); return; }
    setSaving(true);
    const res = isEdit
      ? await api.patch(`/filters/${id}`, { name, conditions, is_shared: isShared })
      : await api.post("/filters", { name, conditions, is_shared: isShared }, true);
    setSaving(false);
    if (res.message) nav("/leads");
    else setMsg(res.error || "Failed");
  };

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => nav("/leads")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{isEdit ? "Edit Filter" : "Create Filter"}</h2>
            <p className="text-sm text-gray-500">Define conditions to create a custom lead view</p>
          </div>
        </div>

        {msg && <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">{msg}</div>}

        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
          {/* Filter name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Filter Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Program-1, Website Leads, New BBA"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conditions (ALL must match)</label>
              <button onClick={addCondition} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                + Add Condition
              </button>
            </div>
            <div className="space-y-3">
              {conditions.map((cond, i) => {
                const opts = getOptions(cond.field);
                return (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {/* Field */}
                    <select value={cond.field} onChange={e => updateCondition(i, "field", e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white flex-1 min-w-0">
                      {FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                    {/* Operator */}
                    <select value={cond.op} onChange={e => updateCondition(i, "op", e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white w-28 shrink-0">
                      {OPS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                    </select>
                    {/* Value — always dropdown */}
                    <select value={cond.value} onChange={e => updateCondition(i, "value", e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white flex-1 min-w-0">
                      <option value="">Select value...</option>
                      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {conditions.length > 1 && (
                      <button onClick={() => removeCondition(i)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shared toggle */}
          <div className="flex items-center gap-3 pt-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isShared} onChange={e => setIsShared(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
            </label>
            <div>
              <p className="text-sm font-medium text-gray-700">Share with all users</p>
              <p className="text-xs text-gray-400">All admins and managers can see this filter</p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-600 mb-1">Filter Preview</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Show leads where{" "}
              {conditions.filter(c => c.value).length === 0 && <span className="text-blue-400">— add conditions above</span>}
              {conditions.filter(c => c.value).map((c, i) => {
                const label = getOptions(c.field).find(o => o.value === c.value)?.label || c.value;
                return (
                  <span key={i}>
                    {i > 0 && <span className="font-bold"> AND </span>}
                    <span className="font-semibold">{FIELDS.find(f=>f.key===c.field)?.label}</span>
                    {" "}{c.op.replace("_"," ")}{" "}
                    <span className="font-semibold text-blue-800">"{label}"</span>
                  </span>
                );
              })}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving}
              className="flex-1 py-2.5 text-white rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
              {saving ? "Saving..." : isEdit ? "Update Filter" : "Save Filter"}
            </button>
            <button onClick={() => nav("/leads")} className="px-5 py-2.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
