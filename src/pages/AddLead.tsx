import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";

const LEVELS = ["bachelor","master","diploma"];
const HEAR   = ["Social Media","Friend / Family","School / College","Newspaper / Magazine","Online Search","Advertisement","Other"];

export default function AddLead() {
  const nav = useNavigate();
  const [statuses, setStatuses] = useState<any[]>([]);
  const [admins, setAdmins]     = useState<any[]>([]);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");
  const [form, setForm] = useState({
    full_name:"", phone:"", email:"", city:"", state:"",
    program_level:"", program:"", hear_about:"", status:"new", assigned_to:""
  });

  useEffect(() => {
    api.get("/statuses").then(r => { if(Array.isArray(r)) setStatuses(r); });
    api.get("/admins").then(r => { if(Array.isArray(r)) setAdmins(r); });
  }, []);

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) { setMsg("Name and phone required"); return; }
    setSaving(true);
    const res = await api.post("/leads/manual", {
      ...form,
      assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null,
    }, true);
    setSaving(false);
    if (res.id || res.message) nav("/leads");
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
            <h2 className="text-xl font-bold text-gray-800">Add Lead</h2>
            <p className="text-sm text-gray-500">Manually add a new lead</p>
          </div>
        </div>

        {msg && <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">{msg}</div>}

        <form onSubmit={submit} className="bg-white rounded-xl border shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Full Name *</label>
              <input required value={form.full_name} onChange={e => setForm({...form,full_name:e.target.value})} className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Phone *</label>
              <input required value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">City</label>
              <input value={form.city} onChange={e => setForm({...form,city:e.target.value})} className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">State</label>
              <input value={form.state} onChange={e => setForm({...form,state:e.target.value})} className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Program Level</label>
              <select value={form.program_level} onChange={e => setForm({...form,program_level:e.target.value})} className={inp}>
                <option value="">Select...</option>
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Program</label>
              <input value={form.program} onChange={e => setForm({...form,program:e.target.value})} className={inp} placeholder="e.g. B.Com. (Hons.)" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Lead Source</label>
              <select value={form.hear_about} onChange={e => setForm({...form,hear_about:e.target.value})} className={inp}>
                <option value="">Select...</option>
                {HEAR.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form,status:e.target.value})} className={inp}>
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Assign To</label>
              <select value={form.assigned_to} onChange={e => setForm({...form,assigned_to:e.target.value})} className={inp}>
                <option value="">— Unassigned —</option>
                {admins.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role?.replace("_"," ")})</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 text-white rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
              {saving ? "Adding..." : "Add Lead"}
            </button>
            <button type="button" onClick={() => nav("/leads")}
              className="px-5 py-2.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
