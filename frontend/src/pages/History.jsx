import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Trash2, Eye, Calendar, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const History = () => {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter States
  const [search, setSearch] = useState('');
  const [predictionFilter, setPredictionFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, per_page: 10 });

  // Modal States
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        per_page: 10,
        sort,
        search: search.trim(),
        prediction: predictionFilter,
        risk_level: riskFilter
      };
      const res = await api.get('/history', { params });
      setItems(res.data.items);
      setPagination({
        total: res.data.total,
        pages: res.data.pages,
        per_page: res.data.per_page
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load evaluation history.');
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, predictionFilter, riskFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/history/${deleteId}`);
      showSuccess('Evaluation record deleted successfully.');
      setDeleteId(null);
      fetchHistory();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to delete record.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Evaluation History</h1>
          <p className="text-sm text-slate-600 mt-1">Review, search, and manage your previously analyzed job postings</p>
        </div>
      </div>

      {/* Controls & Filters Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search title or company..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Verdict Filter */}
          <div>
            <select
              value={predictionFilter}
              onChange={(e) => { setPredictionFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Verdicts (Genuine & Fake)</option>
              <option value="Genuine">Genuine Only</option>
              <option value="Suspicious">Suspicious / Fake Only</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="High">High Risk Only</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="newest">Sort by Date (Newest First)</option>
              <option value="oldest">Sort by Date (Oldest First)</option>
              <option value="risk_desc">Sort by Risk Score (Highest First)</option>
              <option value="risk_asc">Sort by Risk Score (Lowest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Table or States */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" label="Loading evaluation history..." />
        </div>
      ) : error ? (
        <ErrorState title="History Error" message={error} onRetry={fetchHistory} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No Matching History Records"
          message="No evaluation records matched your filter criteria or search query."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Verdict</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const job = item.job_posting || {};
                  const isGenuine = item.prediction === 'Genuine';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{job.title || 'Untitled Job'}</div>
                        {job.employment_type && (
                          <div className="text-xs text-slate-400">{job.employment_type}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{job.location || 'Unspecified'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={isGenuine ? 'genuine' : 'suspicious'} size="sm">
                          {item.prediction}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{item.confidence_score}%</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.risk_level.toLowerCase()} size="sm">
                          {item.risk_score} / 100 ({item.risk_level})
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDetail(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-medium text-slate-500">
                Page {page} of {pagination.pages} ({pagination.total} total items)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4 inline" /> Previous
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        title="Evaluation Report Details"
        maxWidth="max-w-2xl"
      >
        {selectedDetail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verdict</span>
                <Badge variant={selectedDetail.prediction === 'Genuine' ? 'genuine' : 'suspicious'} size="lg" className="mt-1">
                  {selectedDetail.prediction} ({selectedDetail.confidence_score}% Confidence)
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Risk Score</span>
                <Badge variant={selectedDetail.risk_level.toLowerCase()} size="lg" className="mt-1">
                  {selectedDetail.risk_score} / 100 ({selectedDetail.risk_level})
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Job Title</h4>
              <p className="text-base font-bold text-slate-900">{selectedDetail.job_posting?.title || 'N/A'}</p>
            </div>

            {selectedDetail.job_posting?.company_profile && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Profile</h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed">{selectedDetail.job_posting.company_profile}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Job Description</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed max-h-48 overflow-y-auto">{selectedDetail.job_posting?.description}</p>
            </div>

            {/* Risk Factors */}
            <div>
              <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Identified Risk Factors</h4>
              {selectedDetail.risk_factors && selectedDetail.risk_factors.length > 0 ? (
                <div className="space-y-2">
                  {selectedDetail.risk_factors.map((rf, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-xs">
                      <span className="font-bold text-rose-900 block">{rf.factor} (+{rf.points} pts)</span>
                      <span className="text-rose-700">{rf.explanation}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg">No risk factors identified.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Record Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this evaluation history record? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              {deleting ? <Spinner size="sm" /> : 'Delete Entry'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default History;
