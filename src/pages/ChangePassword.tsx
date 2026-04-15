import { useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";

export default function ChangePassword() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.new_password !== form.confirm_password) { setError("New passwords do not match"); return; }
    if (form.new_password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const res = await api.post("/admins/change-password", {
      current_password: form.current_password,
      new_password: form.new_password,
    });
    setLoading(false);
    if (res.error) { setError(res.error); }
    else { setSuccess("Password changed successfully!"); setForm({ current_password: "", new_password: "", confirm_password: "" }); }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Change Password</h1>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border dark:border-gray-800 p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Current Password</label>
              <input
                type="password" required value={form.current_password}
                onChange={e => setForm({ ...form, current_password: e.target.value })}
                placeholder="Enter current password"
                className="w-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:text-gray-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">New Password</label>
              <input
                type="password" required value={form.new_password}
                onChange={e => setForm({ ...form, new_password: e.target.value })}
                placeholder="Enter new password"
                className="w-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:text-gray-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
              <input
                type="password" required value={form.confirm_password}
                onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                placeholder="Confirm new password"
                className="w-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:text-gray-100 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
                ⚠ {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-green-600 dark:text-green-400 text-sm">
                ✓ {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #c0392b, #8e1a10)" }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
