import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";

// All program titles for assignment
const ALL_PROGRAMS = [
  "B.Com.","B.Com. (Banking & Insurance)","B.Com. (Accounting & Finance)",
  "B.Com. (Financial Markets)","B.Com. in Management Studies","B.Com. in Business Administration",
  "B.Com. in Business Administration (Entrepreneurship)","B.Com. in Business Administration (Artificial Intelligence)",
  "B.Com. in Business Administration (Financial Technology-Fin Tech)","B.Com. in Business Administration (Professional Accountancy and Financial Management)",
  "B.Com. (Investment Management)","B.Com. (Transport Management)",
  "B.Sc. (Computer Science)","B.Sc. (IT)","B.Sc. (Data Science)",
  "B.Sc. in Interior Design","B.Sc. in Integrative Nutrition and Dietetics",
  "B.Sc. in Event Management & Public Relations","B.Sc. in Digital Media & Growth Marketing",
  "B.Sc. in Fashion Design & Entrepreneurship","B.Sc. in Business and Management",
  "B.Sc. in Finance","B.Sc. in Economics","B.Sc. in Economics and Finance",
  "B.A. in Psychology","B.A. (Multimedia & Mass Communication)","B.A.",
  "M.Com. (Banking & Finance)","M.Com. (Advanced Accountancy)","M.Com. (Business & Management)",
  "M.Sc. (AI)","M.Sc. (Cyber Security)","M.Sc. in Interior Design","M.Sc. in Event Management & Public Relations",
  "M.Sc in Integrative Nutrition and Dietetics","M.Sc. in Fashion Design & Entrepreneurship",
  "Diploma in Interior Design (DID)","PG Diploma in Interior Design (PGDID)",
  "Diploma in Health & Integrative Lifestyle (DHIL)","PG Diploma in Holistic Lifestyle & Wellness Coaching (PGD-HLWC)",
  "Diploma in Aspects of Media, Marketing and Events (DAME)","Diploma in Event Management & Public Relations (DEM)",
  "PG Diploma in Aspects of Media, Marketing and Events (PGDAME)","PG Diploma in Event Management & Public Relations (PGDEM)",
  "Diploma in Digital Media and Growth Marketing","Diploma in Capital Markets and Investment Management",
  "PG Diploma in Fashion Design & Entrepreneurship","Under Graduate Diploma in Fashion Design & Entrepreneurship",
];

const PERM_LABELS = [
  { key: "canViewLeads",     label: "View Leads" },
  { key: "canEditLeads",     label: "Edit Leads" },
  { key: "canDeleteLeads",   label: "Delete Leads" },
  { key: "canExportLeads",   label: "Export Leads" },
  { key: "canViewReports",   label: "View Reports" },
  { key: "canManageFilters", label: "Manage Filters" },
];
const DEFAULT_PERMS = { canViewLeads:true, canEditLeads:true, canDeleteLeads:false, canExportLeads:false, canViewReports:true, canManageFilters:true };

export default function AdminManagement() {
  const me = JSON.parse(localStorage.getItem("user") || "{}");
  const [admins, setAdmins]           = useState<any[]>([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [editTarget, setEditTarget]   = useState<any>(null);
  const [editingSelf, setEditingSelf] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [resetTarget, setResetTarget] = useState<any>(null);
  const [msg, setMsg]                 = useState({ text:"", type:"" });
  const [savingPerms, setSavingPerms] = useState<number|null>(null);
  const [localPerms, setLocalPerms]   = useState<Record<number,any>>({});
  const [localPrograms, setLocalPrograms] = useState<Record<number,string[]>>({});

  const [newAdmin, setNewAdmin]       = useState({ name:"", email:"", password:"", role:"admin", phone:"" });
  const [changePass, setChangePass]   = useState({ current_password:"", new_password:"", confirm:"" });
  const [resetPass, setResetPass]     = useState({ new_password:"", confirm:"" });

  const load = async () => {
    const res = await api.get("/admins");
    const list = Array.isArray(res) ? res : [];
    setAdmins(list);
    const permsMap: Record<number,any> = {};
    const progsMap: Record<number,string[]> = {};
    list.forEach((a: any) => {
      permsMap[a.id] = a.permissions || { ...DEFAULT_PERMS };
      progsMap[a.id] = (a.programAssignments || []).map((p: any) => p.program);
    });
    setLocalPerms(permsMap);
    setLocalPrograms(progsMap);
  };
  useEffect(() => { load(); }, []);

  const flash = (text: string, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text:"", type:"" }), 3000);
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post("/admins", newAdmin, true);
    if (res.message) { flash(res.message); setShowCreate(false); setNewAdmin({ name:"", email:"", password:"", role:"admin", phone:"" }); load(); }
    else flash(res.error, "error");
  };

  const updateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.patch(`/admins/${editTarget.id}`, { name: editTarget.name, role: editTarget.role });
    if (res.message) { flash("Account updated"); setEditTarget(null); load(); }
    else flash(res.error || "Failed", "error");
  };

  const updateSelf = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.patch("/admins/me", { name: editTarget.name, email: editTarget.email, phone: editTarget.phone || null });
    if (res.message) {
      flash("Profile updated");
      if (res.user) localStorage.setItem("user", JSON.stringify(res.user));
      setEditTarget(null);
      setEditingSelf(false);
      load();
    } else flash(res.error || "Failed", "error");
  };

  const deleteAdmin = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await api.del(`/admins/${id}`);
    if (res.message) { flash(res.message); load(); }
    else flash(res.error, "error");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changePass.new_password !== changePass.confirm) return flash("Passwords don't match", "error");
    const res = await api.post("/admins/change-password", { current_password: changePass.current_password, new_password: changePass.new_password }, true);
    if (res.message) { flash(res.message); setShowChangePass(false); setChangePass({ current_password:"", new_password:"", confirm:"" }); }
    else flash(res.error, "error");
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPass.new_password !== resetPass.confirm) return flash("Passwords don't match", "error");
    const res = await api.post(`/admins/${resetTarget.id}/reset-password`, { new_password: resetPass.new_password }, true);
    if (res.message) { flash(res.message); setResetTarget(null); setResetPass({ new_password:"", confirm:"" }); }
    else flash(res.error, "error");
  };

  const savePerms = async (adminId: number) => {
    setSavingPerms(adminId);
    await api.patch(`/admins/${adminId}/permissions`, localPerms[adminId]);
    // Save program assignments
    await api.put(`/admins/${adminId}/programs`, { programs: localPrograms[adminId] || [] });
    setSavingPerms(null);
    flash("Saved");
  };

  const toggleProgram = (adminId: number, program: string) => {
    setLocalPrograms(prev => {
      const cur = prev[adminId] || [];
      return { ...prev, [adminId]: cur.includes(program) ? cur.filter(p => p !== program) : [...cur, program] };
    });
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400";
  const nonSuper = admins.filter(a => a.role !== "super_admin");

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Admin Management</h2>
          <p className="text-sm text-gray-500">Manage users, permissions and program access</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowChangePass(true)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50">🔑 Change Password</button>
          {me.role === "super_admin" && (
            <>
              <button onClick={() => { setEditTarget({...admins.find((a:any)=>a.id===me.id)||me}); setEditingSelf(true); }} className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50">✏️ My Profile</button>
              <button onClick={() => setShowCreate(true)} className="px-3 py-2 text-white rounded-lg text-xs font-medium" style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>+ Add User</button>
            </>
          )}
        </div>
      </div>

      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.type==="error"?"bg-red-50 text-red-600 border border-red-200":"bg-green-50 text-green-700 border border-green-200"}`}>{msg.text}</div>
      )}

      {/* Users table — desktop */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b bg-gray-50"><h3 className="font-semibold text-gray-700 text-sm">All Users</h3></div>

        {/* Mobile cards */}
        <div className="divide-y divide-gray-100 sm:hidden">
          {admins.map(a => (
            <div key={a.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{a.name} {a.id===me.id&&<span className="text-xs text-gray-400">(you)</span>}</p>
                  <p className="text-xs text-gray-500">{a.email}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.role==="super_admin"?"bg-purple-100 text-purple-700":a.role==="manager"?"bg-orange-100 text-orange-700":"bg-blue-100 text-blue-700"}`}>
                  {a.role==="super_admin"?"Super Admin":a.role==="manager"?"Manager":"Admin"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{(a.programAssignments||[]).length > 0 ? `${(a.programAssignments||[]).length} programs` : "All programs"}</span>
                <span>{new Date(a.createdAt||a.created_at).toLocaleDateString("en-IN")}</span>
              </div>
              {me.role==="super_admin" && a.id!==me.id && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditTarget({...a})} className="text-xs px-3 py-1 border rounded-lg hover:bg-gray-50 text-blue-600">Edit</button>
                  <button onClick={() => setResetTarget(a)} className="text-xs px-3 py-1 border rounded-lg hover:bg-gray-50 text-gray-600">Reset Pass</button>
                  <button onClick={() => deleteAdmin(a.id, a.name)} className="text-xs px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50 text-red-500">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{["Name","Email","Role","Programs","Created","Actions"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">{a.name} {a.id===me.id&&<span className="text-xs text-gray-400">(you)</span>}</td>
                  <td className="px-5 py-3 text-gray-600">{a.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${a.role==="super_admin"?"bg-purple-100 text-purple-700":a.role==="manager"?"bg-orange-100 text-orange-700":"bg-blue-100 text-blue-700"}`}>
                      {a.role==="super_admin"?"Super Admin":a.role==="manager"?"Manager":"Admin"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {(a.programAssignments||[]).length > 0
                      ? <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">{(a.programAssignments||[]).length} programs</span>
                      : <span className="text-gray-300">All programs</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{new Date(a.createdAt||a.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {me.role==="super_admin" && a.id!==me.id && (
                        <>
                          <button onClick={() => setEditTarget({...a})} className="text-xs px-3 py-1 border rounded-lg hover:bg-gray-50 text-blue-600 whitespace-nowrap">Edit</button>
                          <button onClick={() => setResetTarget(a)} className="text-xs px-3 py-1 border rounded-lg hover:bg-gray-50 text-gray-600 whitespace-nowrap">Reset Pass</button>
                          <button onClick={() => deleteAdmin(a.id, a.name)} className="text-xs px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50 text-red-500 whitespace-nowrap">Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions + Program Assignment */}
      {me.role==="super_admin" && nonSuper.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm">Permissions & Program Access</h3>
            <p className="text-xs text-gray-400 mt-0.5">Assign programs to restrict which leads a user can see. Leave empty = see all.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">User</th>
                  {PERM_LABELS.map(p => (
                    <th key={p.key} className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">{p.label}</th>
                  ))}
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nonSuper.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800">{a.name}</div>
                      <div className="text-xs text-gray-400">{a.email}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${a.role==="manager"?"bg-orange-100 text-orange-700":"bg-blue-100 text-blue-700"}`}>
                        {a.role==="manager"?"Manager":"Admin"}
                      </span>
                    </td>
                    {PERM_LABELS.map(p => (
                      <td key={p.key} className="px-3 py-4 text-center">
                        <input type="checkbox" checked={localPerms[a.id]?.[p.key]??false}
                          onChange={e => setLocalPerms(prev => ({...prev, [a.id]:{...prev[a.id],[p.key]:e.target.checked}}))}
                          className="w-4 h-4 rounded border-gray-300 accent-red-500 cursor-pointer" />
                      </td>
                    ))}
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => savePerms(a.id)} disabled={savingPerms===a.id}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-50"
                        style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
                        {savingPerms===a.id?"Saving...":"Save"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Program Assignment per user */}
          <div className="border-t px-5 py-5">
            <h4 className="font-semibold text-gray-700 text-sm mb-1">Program Access per User</h4>
            <p className="text-xs text-gray-400 mb-4">Select programs each user can see. Leads from these programs will auto-assign to them.</p>
            <div className="space-y-4">
              {nonSuper.map(a => (
                <div key={a.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">{a.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{(localPrograms[a.id]||[]).length} programs selected</span>
                    </div>
                    <button onClick={() => setLocalPrograms(prev => ({...prev, [a.id]:[]}))}
                      className="text-xs text-gray-400 hover:text-red-500">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {ALL_PROGRAMS.map(p => {
                      const selected = (localPrograms[a.id]||[]).includes(p);
                      return (
                        <button key={p} onClick={() => toggleProgram(a.id, p)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${selected?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-600 border-gray-200 hover:border-indigo-400"}`}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={() => savePerms(a.id)} disabled={savingPerms===a.id}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-50"
                      style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
                      {savingPerms===a.id?"Saving...":"Save Programs"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create New User" onClose={() => setShowCreate(false)}>
          <form onSubmit={createAdmin} className="space-y-4">
            <div><label className="label">Full Name</label><input required value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin,name:e.target.value})} className={inp} /></div>
            <div><label className="label">Email</label><input type="email" required value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin,email:e.target.value})} className={inp} /></div>
            <div><label className="label">Password</label><input type="password" required minLength={6} value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin,password:e.target.value})} className={inp} /></div>
            <div>
              <label className="label">WhatsApp Number <span className="text-gray-400 font-normal">(for notifications)</span></label>
              <input type="tel" placeholder="e.g. 9876543210" value={newAdmin.phone} onChange={e => setNewAdmin({...newAdmin,phone:e.target.value})} className={inp} />
            </div>
            <div><label className="label">Role</label>
              <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin,role:e.target.value})} className={inp}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 text-white rounded-lg text-sm font-semibold" style={{ background:"#c0392b" }}>Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal title={editingSelf ? "Edit My Profile" : `Edit — ${editTarget.name}`} onClose={() => { setEditTarget(null); setEditingSelf(false); }}>
          <form onSubmit={editingSelf ? updateSelf : updateAdmin} className="space-y-4">
            <div><label className="label">Full Name</label><input required value={editTarget.name} onChange={e => setEditTarget({...editTarget,name:e.target.value})} className={inp} /></div>
            <div><label className="label">Email</label><input type="email" required={editingSelf} value={editTarget.email} disabled={!editingSelf} onChange={e => setEditTarget({...editTarget,email:e.target.value})} className={inp+(editingSelf?"":" opacity-50 cursor-not-allowed")} /></div>
            {editingSelf && (
              <div>
                <label className="label">WhatsApp Number <span className="text-gray-400 font-normal">(for lead notifications)</span></label>
                <input type="tel" placeholder="e.g. 9876543210" value={editTarget.phone || ""} onChange={e => setEditTarget({...editTarget,phone:e.target.value})} className={inp} />
              </div>
            )}
            {!editingSelf && (
              <div><label className="label">Role</label>
                <select value={editTarget.role} onChange={e => setEditTarget({...editTarget,role:e.target.value})} className={inp}>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 text-white rounded-lg text-sm font-semibold" style={{ background:"#c0392b" }}>Update</button>
              <button type="button" onClick={() => { setEditTarget(null); setEditingSelf(false); }} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Password */}
      {showChangePass && (
        <Modal title="Change My Password" onClose={() => setShowChangePass(false)}>
          <form onSubmit={changePassword} className="space-y-4">
            <div><label className="label">Current Password</label><input type="password" required value={changePass.current_password} onChange={e => setChangePass({...changePass,current_password:e.target.value})} className={inp} /></div>
            <div><label className="label">New Password</label><input type="password" required minLength={6} value={changePass.new_password} onChange={e => setChangePass({...changePass,new_password:e.target.value})} className={inp} /></div>
            <div><label className="label">Confirm</label><input type="password" required value={changePass.confirm} onChange={e => setChangePass({...changePass,confirm:e.target.value})} className={inp} /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 text-white rounded-lg text-sm font-semibold" style={{ background:"#c0392b" }}>Update</button>
              <button type="button" onClick={() => setShowChangePass(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password */}
      {resetTarget && (
        <Modal title={`Reset Password — ${resetTarget.name}`} onClose={() => setResetTarget(null)}>
          <form onSubmit={resetPassword} className="space-y-4">
            <div><label className="label">New Password</label><input type="password" required minLength={6} value={resetPass.new_password} onChange={e => setResetPass({...resetPass,new_password:e.target.value})} className={inp} /></div>
            <div><label className="label">Confirm</label><input type="password" required value={resetPass.confirm} onChange={e => setResetPass({...resetPass,confirm:e.target.value})} className={inp} /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 text-white rounded-lg text-sm font-semibold" style={{ background:"#c0392b" }}>Reset</button>
              <button type="button" onClick={() => setResetTarget(null)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
