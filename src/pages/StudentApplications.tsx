import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import { Search, Filter, Calendar, User, Mail, Phone, BookOpen, Trash2, FileText } from "lucide-react";

interface Application {
  id: number;
  applicationNo: string;
  firstName: string;
  surname: string;
  studentEmail: string;
  studentMobile: string;
  stream: string;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function StudentApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [pagination.page, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`/student-admissions?${params}`);
      if (res.success) {
        setApplications(res.data || []);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    setUpdatingStatus(id);
    try {
      const res = await api.patch(`/student-admissions/${id}/status`, { status: newStatus });
      if (res.success) {
        setApplications(apps => apps.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        ));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (id: number, applicationNo: string) => {
    if (!confirm(`Are you sure you want to delete application ${applicationNo}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await api.del(`/student-admissions/${id}`);
      if (res.success) {
        setApplications(apps => apps.filter(app => app.id !== id));
        setPagination(p => ({ ...p, total: p.total - 1 }));
      } else {
        alert(res.error || "Failed to delete application");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewPDF = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/student-admissions/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
      
      // Get the application number from the current application
      const app = applications.find(a => a.id === id);
      const filename = app ? `Application-${app.applicationNo}.pdf` : `Application-${id}.pdf`;
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open in new window
      const pdfWindow = window.open(url, '_blank');
      if (pdfWindow) {
        // Set the window title to the application number
        pdfWindow.onload = () => {
          pdfWindow.document.title = filename;
        };
      }
      
      // Clean up after 5 seconds
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Failed to open PDF');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      app.applicationNo.toLowerCase().includes(search) ||
      app.firstName.toLowerCase().includes(search) ||
      app.surname.toLowerCase().includes(search) ||
      app.studentEmail.toLowerCase().includes(search) ||
      app.studentMobile.includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
      under_review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
      approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
      admission_done: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
      pending: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400",
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Student Applications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage admission applications for Academic Year 2026-2027
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Total: <span className="text-gray-800 dark:text-gray-100 font-semibold">{pagination.total}</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, mobile, app#..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="admission_done">Admission Done</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                  hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No applications found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {searchTerm || statusFilter ? "Try adjusting your filters" : "Applications will appear here once submitted"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Application #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Stream
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-800">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono font-semibold text-red-600 dark:text-red-400">
                            {app.applicationNo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            {app.firstName} {app.surname}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">{app.studentEmail}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                              <Phone className="w-3 h-3" />
                              <span>{app.studentMobile}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{app.stream}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                            disabled={updatingStatus === app.id}
                            className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer
                              focus:outline-none focus:ring-2 focus:ring-red-500/20
                              ${getStatusBadge(app.status)}
                              ${updatingStatus === app.id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <option value="new">New</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="admission_done">Admission Done</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(app.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewPDF(app.id)}
                              title="View Application PDF"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20
                                rounded-lg transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View PDF
                            </button>
                            <button
                              onClick={() => handleDelete(app.id, app.applicationNo)}
                              disabled={deletingId === app.id}
                              title="Delete Application"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                                rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {deletingId === app.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y dark:divide-gray-800">
                {filteredApplications.map((app) => (
                  <div key={app.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {app.firstName} {app.surname}
                        </p>
                        <p className="text-xs font-mono text-red-600 dark:text-red-400">{app.applicationNo}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{app.studentEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        <span>{app.studentMobile}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        <span>{app.stream}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(app.createdAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewPDF(app.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium
                        text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20
                        border border-blue-200 dark:border-blue-900/40 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View PDF
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="border-t dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400
                        hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
                        border dark:border-gray-700 rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400
                        hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
                        border dark:border-gray-700 rounded-lg transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
