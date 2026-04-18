import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

interface Institute {
  id: number;
  name: string;
  genioSubdomain: string | null;
  genioCollegeId: number | null;
  branches: Branch[];
}
interface Branch {
  id: number;
  instituteId: number;
  name: string;
  genioBranchId: number | null;
}
interface CourseMapping {
  id: number;
  branchId: number;
  ourCourseName: string;
  externalCourseName: string;
  genioCourseId: number | null;
  genioSpecializationId: number | null;
  branch: { id: number; name: string; institute: { id: number; name: string } };
}

export default function CourseMappings() {
  const [institutes, setInstitutes]     = useState<Institute[]>([]);
  const [selInstitute, setSelInstitute] = useState<number | "">("");
  const [selBranch, setSelBranch]       = useState<number | "">("");
  const [mappings, setMappings]         = useState<CourseMapping[]>([]);
  const [loading, setLoading]           = useState(false);
  const [msg, setMsg]                   = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // ── Modals state ──────────────────────────────────────────────────────────
  const [instModal,   setInstModal]   = useState(false);
  const [branchModal, setBranchModal] = useState(false);
  const [mapModal,    setMapModal]    = useState(false);
  const [editInstModal,   setEditInstModal]   = useState<Institute | null>(null);
  const [editBranchModal, setEditBranchModal] = useState<Branch | null>(null);

  // ── Forms ─────────────────────────────────────────────────────────────────
  const [instForm,   setInstForm]   = useState({ name: "", genioSubdomain: "", genioCollegeId: "" });
  const [branchForm, setBranchForm] = useState({ name: "", genioBranchId: "" });
  const [mapForm,    setMapForm]    = useState({ ourCourseName: "", externalCourseName: "", genioCourseId: "", genioSpecializationId: "" });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const flash = (type: "ok" | "err", text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const loadInstitutes = useCallback(async () => {
    const r = await fetch(`${API}/institutes`, { headers: headers() });
    if (r.ok) setInstitutes(await r.json());
  }, []);

  const loadMappings = useCallback(async () => {
    if (!selBranch && !selInstitute) { setMappings([]); return; }
    setLoading(true);
    const qs = selBranch ? `branchId=${selBranch}` : `instituteId=${selInstitute}`;
    const r = await fetch(`${API}/api/course-mappings?${qs}`, { headers: headers() });
    if (r.ok) setMappings(await r.json());
    setLoading(false);
  }, [selBranch, selInstitute]);

  useEffect(() => { loadInstitutes(); }, [loadInstitutes]);
  useEffect(() => { loadMappings(); }, [loadMappings]);

  const currentBranches = institutes.find(i => i.id === selInstitute)?.branches ?? [];

  // ── Institute CRUD ────────────────────────────────────────────────────────
  const saveInstitute = async () => {
    if (!instForm.name.trim()) return;
    const r = await fetch(`${API}/institutes`, {
      method: "POST", headers: headers(),
      body: JSON.stringify(instForm),
    });
    const d = await r.json();
    if (!r.ok) { flash("err", d.error || "Error"); return; }
    flash("ok", `Institute "${d.name}" added`);
    setInstModal(false); setInstForm({ name: "", genioSubdomain: "", genioCollegeId: "" });
    loadInstitutes();
  };

  const updateInstitute = async () => {
    if (!editInstModal) return;
    const r = await fetch(`${API}/api/institutes/${editInstModal.id}`, {
      method: "PATCH", headers: headers(),
      body: JSON.stringify(instForm),
    });
    const d = await r.json();
    if (!r.ok) { flash("err", d.error || "Error"); return; }
    flash("ok", "Institute updated");
    setEditInstModal(null); loadInstitutes();
  };

  const deleteInstitute = async (id: number, name: string) => {
    if (!confirm(`Delete institute "${name}" and all its branches & mappings?`)) return;
    const r = await fetch(`${API}/api/institutes/${id}`, { method: "DELETE", headers: headers() });
    if (r.ok) { flash("ok", "Deleted"); if (selInstitute === id) { setSelInstitute(""); setSelBranch(""); } loadInstitutes(); }
    else flash("err", "Error deleting");
  };

  // ── Branch CRUD ───────────────────────────────────────────────────────────
  const saveBranch = async () => {
    if (!branchForm.name.trim() || !selInstitute) return;
    const r = await fetch(`${API}/api/institutes/${selInstitute}/branches`, {
      method: "POST", headers: headers(),
      body: JSON.stringify(branchForm),
    });
    const d = await r.json();
    if (!r.ok) { flash("err", d.error || "Error"); return; }
    flash("ok", `Branch "${d.name}" added`);
    setBranchModal(false); setBranchForm({ name: "", genioBranchId: "" });
    loadInstitutes();
  };

  const updateBranch = async () => {
    if (!editBranchModal || !selInstitute) return;
    const r = await fetch(`${API}/api/institutes/${selInstitute}/branches/${editBranchModal.id}`, {
      method: "PATCH", headers: headers(),
      body: JSON.stringify(branchForm),
    });
    if (r.ok) { flash("ok", "Branch updated"); setEditBranchModal(null); loadInstitutes(); }
    else flash("err", "Error updating");
  };

  const deleteBranch = async (b: Branch) => {
    if (!confirm(`Delete branch "${b.name}" and all its course mappings?`)) return;
    const r = await fetch(`${API}/api/institutes/${selInstitute}/branches/${b.id}`, { method: "DELETE", headers: headers() });
    if (r.ok) { flash("ok", "Deleted"); if (selBranch === b.id) setSelBranch(""); loadInstitutes(); loadMappings(); }
    else flash("err", "Error deleting");
  };

  // ── Course Mapping CRUD ───────────────────────────────────────────────────
  const saveMapping = async () => {
    if (!mapForm.ourCourseName.trim() || !mapForm.externalCourseName.trim() || !selBranch) return;
    const r = await fetch(`${API}/course-mappings`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ ...mapForm, branchId: selBranch }),
    });
    const d = await r.json();
    if (!r.ok) { flash("err", d.error || "Error"); return; }
    flash("ok", "Course mapping added");
    setMapModal(false); setMapForm({ ourCourseName: "", externalCourseName: "", genioCourseId: "", genioSpecializationId: "" });
    loadMappings();
  };

  const deleteMapping = async (m: CourseMapping) => {
    if (!confirm(`Delete mapping for "${m.ourCourseName}"?`)) return;
    const r = await fetch(`${API}/api/course-mappings/${m.id}`, { method: "DELETE", headers: headers() });
    if (r.ok) { flash("ok", "Deleted"); loadMappings(); }
    else flash("err", "Error deleting");
  };

  // ── Open edit modals ──────────────────────────────────────────────────────
  const openEditInst = (inst: Institute) => {
    setInstForm({ name: inst.name, genioSubdomain: inst.genioSubdomain || "", genioCollegeId: String(inst.genioCollegeId || "") });
    setEditInstModal(inst);
  };
  const openEditBranch = (b: Branch) => {
    setBranchForm({ name: b.name, genioBranchId: String(b.genioBranchId || "") });
    setEditBranchModal(b);
  };

  // ── Selected institute info ────────────────────────────────────────────────
  const selectedInst = institutes.find(i => i.id === selInstitute);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Flash message */}
        {msg && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg
            ${msg.type === "ok" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {msg.text}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Course Mappings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Map your courses to Genio CRM — leads auto-push on submission</p>
          </div>
          <button onClick={() => { setInstForm({ name: "", genioSubdomain: "", genioCollegeId: "" }); setInstModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#c0392b,#8e1a10)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M12 4v16m8-8H4"/></svg>
            Add Institute
          </button>
        </div>

        {/* Institute cards */}
        {institutes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            <div className="text-4xl mb-3">🏫</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No institutes yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Add Institute" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutes.map(inst => (
              <div key={inst.id}
                onClick={() => { setSelInstitute(inst.id); setSelBranch(""); }}
                className={`cursor-pointer rounded-xl border p-4 transition-all
                  ${selInstitute === inst.id
                    ? "border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-700 shadow-md"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-red-300 dark:hover:border-red-800"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{inst.name}</p>
                    {inst.genioSubdomain && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{inst.genioSubdomain}.mygenioworld.com</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {inst.genioCollegeId && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          College ID: {inst.genioCollegeId}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">{inst.branches.length} branch{inst.branches.length !== 1 ? "es" : ""}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button onClick={e => { e.stopPropagation(); openEditInst(inst); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteInstitute(inst.id, inst.name); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Branches + Mappings section — shown when institute selected */}
        {selInstitute !== "" && selectedInst && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 overflow-hidden">

            {/* Branch filter bar */}
            <div className="px-4 py-3 border-b dark:border-gray-800 flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{selectedInst.name}</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Branch:</span>
              <select value={selBranch} onChange={e => setSelBranch(e.target.value ? parseInt(e.target.value) : "")}
                className="text-sm border dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400">
                <option value="">All Branches</option>
                {currentBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <button onClick={() => { setBranchForm({ name: "", genioBranchId: "" }); setBranchModal(true); }}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M12 4v16m8-8H4"/></svg>
                Add Branch
              </button>
            </div>

            {/* Branch list */}
            {currentBranches.length > 0 && (
              <div className="px-4 py-2 border-b dark:border-gray-800 flex flex-wrap gap-2">
                {currentBranches.map(b => (
                  <div key={b.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all
                      ${selBranch === b.id
                        ? "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                    <button onClick={() => setSelBranch(selBranch === b.id ? "" : b.id)} className="font-medium">
                      {b.name}
                    </button>
                    {b.genioBranchId && <span className="text-gray-400 font-mono">#{b.genioBranchId}</span>}
                    <button onClick={() => openEditBranch(b)} className="text-gray-400 hover:text-blue-500 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={() => deleteBranch(b)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Course mapping table header */}
            <div className="px-4 py-3 border-b dark:border-gray-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Course Mappings {selBranch ? `— ${currentBranches.find(b => b.id === selBranch)?.name}` : "— All Branches"}
              </span>
              {selBranch !== "" && (
                <button onClick={() => { setMapForm({ ourCourseName: "", externalCourseName: "", genioCourseId: "", genioSpecializationId: "" }); setMapModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#c0392b,#8e1a10)" }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M12 4v16m8-8H4"/></svg>
                  Add Mapping
                </button>
              )}
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
              </div>
            ) : mappings.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  {selBranch ? "No course mappings yet. Click \"Add Mapping\" to start." : "Select a branch to manage course mappings."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide w-1/3">Our Course Name (RAV)</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide w-1/3">Genio Course Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Genio IDs</th>
                      {!selBranch && <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Branch</th>}
                      <th className="px-4 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-800">
                    {mappings.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{m.ourCourseName}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{m.externalCourseName}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {m.genioCourseId && (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full w-fit">
                                Course ID: {m.genioCourseId}
                              </span>
                            )}
                            {m.genioSpecializationId && (
                              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full w-fit">
                                Spec ID: {m.genioSpecializationId}
                              </span>
                            )}
                            {!m.genioCourseId && !m.genioSpecializationId && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 italic">No IDs set</span>
                            )}
                          </div>
                        </td>
                        {!selBranch && <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{m.branch.name}</td>}
                        <td className="px-4 py-3">
                          <button onClick={() => deleteMapping(m)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Institute Modal ─────────────────────────────────────────────── */}
      {instModal && (
        <Modal title="Add Institute" onClose={() => setInstModal(false)}>
          <Field label="Institute Name *" value={instForm.name} onChange={v => setInstForm(f => ({ ...f, name: v }))} placeholder="e.g. LSI" />
          <Field label="Genio Subdomain" value={instForm.genioSubdomain} onChange={v => setInstForm(f => ({ ...f, genioSubdomain: v }))} placeholder="e.g. lsi  →  lsi.mygenioworld.com" />
          <Field label="Genio College ID" value={instForm.genioCollegeId} onChange={v => setInstForm(f => ({ ...f, genioCollegeId: v }))} placeholder="e.g. 147" type="number" />
          <ModalActions onCancel={() => setInstModal(false)} onSave={saveInstitute} />
        </Modal>
      )}

      {/* ── Edit Institute Modal ────────────────────────────────────────────── */}
      {editInstModal && (
        <Modal title={`Edit — ${editInstModal.name}`} onClose={() => setEditInstModal(null)}>
          <Field label="Institute Name *" value={instForm.name} onChange={v => setInstForm(f => ({ ...f, name: v }))} placeholder="e.g. LSI" />
          <Field label="Genio Subdomain" value={instForm.genioSubdomain} onChange={v => setInstForm(f => ({ ...f, genioSubdomain: v }))} placeholder="e.g. lsi" />
          <Field label="Genio College ID" value={instForm.genioCollegeId} onChange={v => setInstForm(f => ({ ...f, genioCollegeId: v }))} placeholder="e.g. 147" type="number" />
          <ModalActions onCancel={() => setEditInstModal(null)} onSave={updateInstitute} saveLabel="Update" />
        </Modal>
      )}

      {/* ── Add Branch Modal ────────────────────────────────────────────────── */}
      {branchModal && (
        <Modal title={`Add Branch — ${selectedInst?.name}`} onClose={() => setBranchModal(false)}>
          <Field label="Branch Name *" value={branchForm.name} onChange={v => setBranchForm(f => ({ ...f, name: v }))} placeholder="e.g. Mumbai - Malad" />
          <Field label="Genio Branch ID" value={branchForm.genioBranchId} onChange={v => setBranchForm(f => ({ ...f, genioBranchId: v }))} placeholder="e.g. 78" type="number" />
          <ModalActions onCancel={() => setBranchModal(false)} onSave={saveBranch} />
        </Modal>
      )}

      {/* ── Edit Branch Modal ───────────────────────────────────────────────── */}
      {editBranchModal && (
        <Modal title={`Edit Branch — ${editBranchModal.name}`} onClose={() => setEditBranchModal(null)}>
          <Field label="Branch Name *" value={branchForm.name} onChange={v => setBranchForm(f => ({ ...f, name: v }))} placeholder="e.g. Mumbai - Malad" />
          <Field label="Genio Branch ID" value={branchForm.genioBranchId} onChange={v => setBranchForm(f => ({ ...f, genioBranchId: v }))} placeholder="e.g. 78" type="number" />
          <ModalActions onCancel={() => setEditBranchModal(null)} onSave={updateBranch} saveLabel="Update" />
        </Modal>
      )}

      {/* ── Add Course Mapping Modal ────────────────────────────────────────── */}
      {mapModal && (
        <Modal title={`Add Course Mapping — ${currentBranches.find(b => b.id === selBranch)?.name}`} onClose={() => setMapModal(false)}>
          <Field label="Our Course Name (RAV) *" value={mapForm.ourCourseName} onChange={v => setMapForm(f => ({ ...f, ourCourseName: v }))}
            placeholder="e.g. B.Sc. in Integrative Nutrition and Dietetics" />
          <Field label="Genio Course Name *" value={mapForm.externalCourseName} onChange={v => setMapForm(f => ({ ...f, externalCourseName: v }))}
            placeholder="e.g. B.Sc. (Hons.) in Integrative Nutrition &amp; Dietetics" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Genio Course ID" value={mapForm.genioCourseId} onChange={v => setMapForm(f => ({ ...f, genioCourseId: v }))}
              placeholder="e.g. 1" type="number" />
            <Field label="Genio Specialization ID" value={mapForm.genioSpecializationId} onChange={v => setMapForm(f => ({ ...f, genioSpecializationId: v }))}
              placeholder="e.g. 5" type="number" />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Course ID and Specialization ID come from Genio CRM</p>
          <ModalActions onCancel={() => setMapModal(false)} onSave={saveMapping} />
        </Modal>
      )}
    </Layout>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-sm border dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400" />
    </div>
  );
}

function ModalActions({ onCancel, onSave, saveLabel = "Save" }:
  { onCancel: () => void; onSave: () => void; saveLabel?: string }) {
  return (
    <div className="flex gap-2 pt-2">
      <button onClick={onCancel}
        className="flex-1 py-2 rounded-lg text-sm font-medium border dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        Cancel
      </button>
      <button onClick={onSave}
        className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#c0392b,#8e1a10)" }}>
        {saveLabel}
      </button>
    </div>
  );
}
