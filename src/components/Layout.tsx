import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../lib/useTheme";

// Navigation menu items - Updated: 2026-05-11 14:30 - CACHE BUST v2
const NAV = [
  { label: "Dashboard", href: "/", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/></svg> },
  { label: "All Leads", href: "/leads", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
  { label: "Student Applications", href: "/student-applications", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
  { label: "Kanban", href: "/kanban", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="18" rx="1" strokeWidth="2"/><rect x="10" y="3" width="5" height="12" rx="1" strokeWidth="2"/><rect x="17" y="3" width="5" height="15" rx="1" strokeWidth="2"/></svg> },
  { label: "Reports", href: "/reports", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  { label: "Admin Users", href: "/admins", role: "super_admin", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> },
  { label: "Lead Stages", href: "/lead-stages", role: "super_admin", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> },
  { label: "Add Lead", href: "/add-lead", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M12 4v16m8-8H4"/></svg> },
  { label: "Import Leads", href: "/import-leads", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> },
  { label: "Contact Inquiries", href: "/contact-inquiries", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
  { label: "Course Mappings", href: "/course-mappings", role: "super_admin", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { dark, toggle } = useTheme();
  const logout = () => { localStorage.clear(); nav("/login"); };
  const initials = user.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "A";
  const currentLabel = NAV.find(n => n.href === loc.pathname)?.label || "Dashboard";

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <aside className="fixed top-0 left-0 h-screen z-50 flex flex-col w-14 lg:w-52 bg-white dark:bg-gray-900 border-r dark:border-gray-800 shadow-sm">
        <div className="px-2 lg:px-4 py-4 border-b dark:border-gray-800 flex items-center justify-center lg:justify-start gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#c0392b,#8e1a10)" }}>G</div>
          <div className="hidden lg:block">
            <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">Golwala College</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">CRM Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-1 lg:px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.filter(item => !item.role || user.role === item.role || user.role === "super_admin").map(item => {
            const active = loc.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} title={item.label}
                className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-2.5 px-2 lg:px-3 py-2.5 lg:py-2 rounded-lg text-sm font-medium transition-all ${active ? "text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100"}`}
                style={active ? { background: "linear-gradient(135deg,#c0392b,#8e1a10)" } : {}}>
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-1 lg:px-3 py-2 border-t dark:border-gray-800 shrink-0">
          <button onClick={toggle} title={dark ? "Light Mode" : "Dark Mode"} className="w-full flex items-center justify-center lg:justify-start gap-0 lg:gap-2.5 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100 transition-all">
            {dark ? (
              <>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" strokeWidth="2"/>
                  <path strokeWidth="2" strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                <span className="hidden lg:inline">Light Mode</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
                <span className="hidden lg:inline">Dark Mode</span>
              </>
            )}
          </button>
        </div>

        <div className="px-1 lg:px-3 py-3 border-t dark:border-gray-800 shrink-0">
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#c0392b,#8e1a10)" }}>{initials}</div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">{user.role?.replace("_", " ")}</p>
            </div>
            <div className="flex gap-2 lg:gap-1">
              <Link to="/change-password" title="Change Password" className="text-gray-300 dark:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 transition-colors p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
              </Link>
              <button onClick={logout} title="Logout" className="text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 transition-colors p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 ml-14 lg:ml-52">
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{currentLabel}</span>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-3 py-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,#c0392b,#8e1a10)" }}>{initials}</div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200 hidden sm:block">{user.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold hidden sm:block ${user.role === "super_admin" ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" : user.role === "manager" ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"}`}>
              {user.role === "super_admin" ? "Super Admin" : user.role === "manager" ? "Manager" : "Admin"}
            </span>
          </div>
        </header>
        <div className="flex-1 p-3 md:p-6">{children}</div>
      </main>
    </div>
  );
}
