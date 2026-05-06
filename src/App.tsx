import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Login loads eagerly — it's the entry point
import Login from "./pages/Login";
import StudentApplications from "./pages/StudentApplications";

// All dashboard pages lazy loaded
const Dashboard         = lazy(() => import("./pages/Dashboard"));
const Leads             = lazy(() => import("./pages/Leads"));
const Kanban            = lazy(() => import("./pages/Kanban"));
const Reports           = lazy(() => import("./pages/Reports"));
const AdminManagement   = lazy(() => import("./pages/AdminManagement"));
const LeadStages        = lazy(() => import("./pages/LeadStages"));
const ScheduledCalls    = lazy(() => import("./pages/ScheduledCalls"));
const FilterBuilder     = lazy(() => import("./pages/FilterBuilder"));
const ImportLeads       = lazy(() => import("./pages/ImportLeads"));
const AddLead           = lazy(() => import("./pages/AddLead"));
const ContactInquiries  = lazy(() => import("./pages/ContactInquiries"));
const ChangePassword    = lazy(() => import("./pages/ChangePassword"));
const CourseMappings    = lazy(() => import("./pages/CourseMappings"));

const isAuth = () => !!localStorage.getItem("token");
const Protected = ({ children }: { children: React.ReactNode }) =>
  isAuth() ? <>{children}</> : <Navigate to="/login" replace />;

// Minimal spinner shown while lazy chunk loads
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/"                    element={<Protected><Dashboard /></Protected>} />
        <Route path="/leads"               element={<Protected><Leads /></Protected>} />
        <Route path="/kanban"              element={<Protected><Kanban /></Protected>} />
        <Route path="/reports"             element={<Protected><Reports /></Protected>} />
        <Route path="/admins"              element={<Protected><AdminManagement /></Protected>} />
        <Route path="/lead-stages"         element={<Protected><LeadStages /></Protected>} />
        <Route path="/scheduled-calls"     element={<Protected><ScheduledCalls /></Protected>} />
        <Route path="/filters/new"         element={<Protected><FilterBuilder /></Protected>} />
        <Route path="/filters/:id/edit"    element={<Protected><FilterBuilder /></Protected>} />
        <Route path="/import-leads"        element={<Protected><ImportLeads /></Protected>} />
        <Route path="/add-lead"            element={<Protected><AddLead /></Protected>} />
        <Route path="/contact-inquiries"   element={<Protected><ContactInquiries /></Protected>} />
        <Route path="/change-password"     element={<Protected><ChangePassword /></Protected>} />
        <Route path="/course-mappings"     element={<Protected><CourseMappings /></Protected>} />
        <Route path="/student-applications" element={<Protected><StudentApplications /></Protected>} />
        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
