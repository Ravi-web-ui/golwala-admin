import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api } from "../lib/api";

const LEAD_FIELDS = [
  { key:"full_name",     label:"Full Name *" },
  { key:"phone",         label:"Phone *" },
  { key:"email",         label:"Email" },
  { key:"city",          label:"City" },
  { key:"state",         label:"State" },
  { key:"program_level", label:"Program Level" },
  { key:"program",       label:"Program" },
  { key:"hear_about",    label:"Lead Source" },
  { key:"status",        label:"Status" },
  { key:"country_code",  label:"Country Code" },
  { key:"utm_source",    label:"UTM Source" },
  { key:"utm_campaign",  label:"UTM Campaign" },
  { key:"utm_medium",    label:"UTM Medium" },
  { key:"utm_name",      label:"UTM Name" },
  { key:"skip",          label:"— Skip this column —" },
];

const SAMPLE_CSV = `full_name,phone,email,city,state,program_level,program,hear_about
Ravi Sharma,9876543210,ravi@example.com,Mumbai,Maharashtra,bachelor,B.Com. (Hons.),Social Media
Priya Patel,9123456789,priya@example.com,Pune,Maharashtra,master,M.Com. (Banking & Finance),Website`;

export default function ImportLeads() {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep]           = useState<1|2|3>(1);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows]     = useState<any[]>([]);
  const [mapping, setMapping]     = useState<Record<string,string>>({});
  const [admins, setAdmins]       = useState<any[]>([]);
  const [assignTo, setAssignTo]   = useState("");
  const [autoAssign, setAutoAssign] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult]       = useState("");

  useEffect(() => {
    api.get("/admins").then(r => { if(Array.isArray(r)) setAdmins(r); });
  }, []);

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sample_leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split("\n").filter(l => l.trim());
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g,""));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g,""));
        const obj: Record<string,string> = {};
        headers.forEach((h,i) => { obj[h] = vals[i] || ""; });
        return obj;
      });
      setCsvHeaders(headers);
      setCsvRows(rows);
      // Auto-map matching headers
      const autoMap: Record<string,string> = {};
      headers.forEach(h => {
        const match = LEAD_FIELDS.find(f => f.key === h.toLowerCase().replace(/\s+/g,"_") || f.label.toLowerCase().includes(h.toLowerCase()));
        autoMap[h] = match?.key || "skip";
      });
      setMapping(autoMap);
      setStep(2);
    };
    reader.readAsText(file);
  };

  const doImport = async () => {
    setImporting(true);
    const res = await api.post("/leads/import-csv", {
      rows: csvRows,
      mapping,
      assigned_to: assignTo ? parseInt(assignTo) : null,
      auto_assign: autoAssign,
    }, true);
    setImporting(false);
    setResult(res.message || res.error || "Done");
    setStep(3);
  };

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => nav("/leads")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Import Leads</h2>
            <p className="text-sm text-gray-500">Upload CSV file and map columns to lead fields</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[{n:1,label:"Upload"},{n:2,label:"Map Fields"},{n:3,label:"Done"}].map(s => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.n ? "text-white" : "bg-gray-100 text-gray-400"}`}
                style={step >= s.n ? { background:"linear-gradient(135deg,#c0392b,#8e1a10)" } : {}}>
                {step > s.n ? "✓" : s.n}
              </div>
              <span className={`text-sm font-medium ${step >= s.n ? "text-gray-800" : "text-gray-400"}`}>{s.label}</span>
              {s.n < 3 && <div className="w-8 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Upload CSV File</h3>
              <button onClick={downloadSample}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Download Sample CSV
              </button>
            </div>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-colors"
              onClick={() => fileRef.current?.click()}>
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              <p className="text-sm font-semibold text-gray-600">Click to upload CSV</p>
              <p className="text-xs text-gray-400 mt-1">Supports .csv files</p>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
            </div>
          </div>
        )}

        {/* Step 2: Map + Assign */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Map CSV Columns</h3>
                <span className="text-xs text-gray-400">{csvRows.length} rows found</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {csvHeaders.map(h => (
                  <div key={h} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700 w-40 shrink-0 font-medium">{h}</span>
                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                    <select value={mapping[h] || "skip"} onChange={e => setMapping(m => ({...m, [h]: e.target.value}))}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none">
                      {LEAD_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                    {/* Preview first value */}
                    <span className="text-xs text-gray-400 w-28 truncate shrink-0">{csvRows[0]?.[h] || ""}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assign */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Lead Assignment</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" checked={!autoAssign} onChange={() => setAutoAssign(false)} className="accent-red-500" />
                  <span className="text-sm font-medium text-gray-700">Assign to specific person</span>
                </label>
                {!autoAssign && (
                  <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none ml-6">
                    <option value="">— Unassigned —</option>
                    {admins.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role?.replace("_"," ")})</option>)}
                  </select>
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" checked={autoAssign} onChange={() => setAutoAssign(true)} className="accent-red-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Auto-distribute (Round Robin)</span>
                    <p className="text-xs text-gray-400">Leads will be evenly distributed among all admins/managers</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={doImport} disabled={importing}
                className="flex-1 py-2.5 text-white rounded-lg text-sm font-bold disabled:opacity-40"
                style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
                {importing ? "Importing..." : `Import ${csvRows.length} Leads`}
              </button>
              <button onClick={() => setStep(1)} className="px-5 py-2.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Back</button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="bg-white rounded-xl border shadow-sm p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Import Complete</h3>
            <p className="text-sm text-gray-500 mb-6">{result}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => nav("/leads")}
                className="px-6 py-2.5 text-white rounded-lg text-sm font-bold"
                style={{ background:"linear-gradient(135deg,#c0392b,#8e1a10)" }}>
                View Leads
              </button>
              <button onClick={() => { setStep(1); setCsvHeaders([]); setCsvRows([]); setResult(""); }}
                className="px-6 py-2.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Import More
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
