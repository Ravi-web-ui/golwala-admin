const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

// Auto logout and redirect on 401
function handle401() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

const headers = (auth = true, json = true) => {
  const h: Record<string, string> = {};
  if (json) h["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  return h;
};

async function handleResponse(r: Response) {
  if (r.status === 401) { handle401(); return { error: "Unauthorized" }; }
  return r.json();
}

export const api = {
  async post(path: string, body: object, auth = false) {
    const r = await fetch(BASE + path, { method: "POST", headers: headers(auth), body: JSON.stringify(body) });
    return handleResponse(r);
  },
  async get(path: string) {
    const r = await fetch(BASE + path, { headers: headers() });
    return handleResponse(r);
  },
  async patch(path: string, body: object) {
    const r = await fetch(BASE + path, { method: "PATCH", headers: headers(), body: JSON.stringify(body) });
    return handleResponse(r);
  },
  async put(path: string, body: object) {
    const r = await fetch(BASE + path, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
    return handleResponse(r);
  },
  async del(path: string) {
    const r = await fetch(BASE + path, { method: "DELETE", headers: headers() });
    return handleResponse(r);
  },
  async downloadCsv() {
    const r = await fetch(BASE + "/reports/export-csv", { headers: headers() });
    if (r.status === 401) { handle401(); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  },
};
