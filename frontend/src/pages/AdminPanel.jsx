import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, Briefcase, AlertTriangle, UploadCloud, Cpu, Database, Trash2, CheckCircle2, AlertCircle, Terminal, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Modal from '../components/Modal';

const AdminPanel = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [error, setError] = useState(null);

  // Upload state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Admin delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAdminStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Forbidden: Admin access required.");
      } else {
        setError(err.response?.data?.error || "Failed to load admin statistics.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await api.get('/metrics');
      setMetrics(res.data);
    } catch (err) {
      setMetrics(null);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminStats();
      fetchMetrics();
    } else {
      setLoading(false);
      setError("Forbidden: Admin access required.");
    }
  }, [user]);

  const handleAdminDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/predictions/${deleteId}`);
      showSuccess(`Admin deleted prediction #${deleteId}.`);
      setDeleteId(null);
      fetchAdminStats();
    } catch (err) {
      showError(err.response?.data?.error || "Failed to delete prediction.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Please select a CSV dataset file to upload.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/admin/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(res.data);
      showSuccess(res.data.message || "Dataset uploaded successfully!");
    } catch (err) {
      const msg = err.response?.data?.error || "Dataset upload failed.";
      setUploadError(msg);
      showError(msg);
    } finally {
      setUploading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="403 Access Forbidden"
          message="You do not have administrator privileges required to access the Admin Panel."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <Spinner size="lg" label="Loading admin panel..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Admin Panel</h1>
            <Badge variant="admin" size="sm">Admin Role</Badge>
          </div>
          <p className="text-sm text-slate-600">Manage system dataset uploads, inspect ML performance, and manage all users' records</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 gap-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          System Overview & All Jobs
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-4 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'metrics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ML Model Performance
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-4 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'upload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Dataset CSV Manager
        </button>
      </div>

      {/* Tab 1: System Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Registered Users</span>
                <span className="text-2xl font-extrabold text-slate-900">{stats?.total_users || 0}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total System Jobs Evaluated</span>
                <span className="text-2xl font-extrabold text-slate-900">{stats?.total_jobs || 0}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">Suspicious / Fake Flagged</span>
                <span className="text-2xl font-extrabold text-rose-600">{stats?.total_suspicious || 0}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Genuine Jobs Verified</span>
                <span className="text-2xl font-extrabold text-emerald-600">{stats?.total_genuine || 0}</span>
              </div>
            </div>
          </div>

          {/* All Users' Predictions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">System-Wide Evaluation Log across All Users</h3>
              <span className="text-xs text-slate-400 font-semibold">{stats?.all_predictions?.length || 0} entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Job Title</th>
                    <th className="px-6 py-3.5">Verdict</th>
                    <th className="px-6 py-3.5">Confidence</th>
                    <th className="px-6 py-3.5">Risk Score</th>
                    <th className="px-6 py-3.5 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.all_predictions && stats.all_predictions.length > 0 ? (
                    stats.all_predictions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 block">{p.username}</span>
                          <span className="text-xs text-slate-400">{p.user_email}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{p.job_title}</td>
                        <td className="px-6 py-4">
                          <Badge variant={p.prediction === 'Genuine' ? 'genuine' : 'suspicious'} size="sm">
                            {p.prediction}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-semibold">{p.confidence_score}%</td>
                        <td className="px-6 py-4">
                          <Badge variant={p.risk_level.toLowerCase()} size="sm">
                            {p.risk_score} / 100 ({p.risk_level})
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                        No predictions recorded across system users yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Model Performance View */}
      {activeTab === 'metrics' && (
        <div>
          {loadingMetrics ? (
            <div className="py-12 flex justify-center">
              <Spinner size="lg" label="Loading ML model metrics..." />
            </div>
          ) : !metrics ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center text-amber-900">
              <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold">Model Not Yet Trained</h3>
              <p className="text-sm text-amber-800 max-w-md mx-auto mt-1 mb-4">
                The metrics artifact <code className="bg-amber-100 px-2 py-0.5 rounded text-xs font-mono">backend/ml/metrics.json</code> could not be found. Please run the training script on the server.
              </p>
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white font-mono text-xs px-4 py-2 rounded-xl">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>python backend/ml/train_model.py</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Active Model Banner */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Classifier</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl font-extrabold text-slate-900">{metrics.primary_model}</span>
                    <Badge variant="genuine" size="sm">Primary Model Active</Badge>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Dataset: <strong className="text-slate-700">{metrics.dataset_name}</strong> ({metrics.total_rows} total rows) • Trained: {new Date(metrics.training_timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Model Comparison Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Side-by-Side Model Metrics Comparison</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Evaluation Metric</th>
                        <th className="px-6 py-4">Logistic Regression</th>
                        <th className="px-6 py-4">Random Forest</th>
                        <th className="px-6 py-4">Winner / Winner Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-900">Accuracy</td>
                        <td className="px-6 py-4 font-semibold text-blue-700">{((metrics.logistic_regression?.accuracy || 0) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 font-semibold text-indigo-700">{((metrics.random_forest?.accuracy || 0) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4">
                          <Badge variant="info" size="sm">
                            {metrics.logistic_regression?.accuracy >= metrics.random_forest?.accuracy ? 'Logistic Regression' : 'Random Forest'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-900">Precision (Fraudulent Class)</td>
                        <td className="px-6 py-4 font-semibold text-blue-700">{((metrics.logistic_regression?.precision || 0) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 font-semibold text-indigo-700">{((metrics.random_forest?.precision || 0) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4">
                          <Badge variant="info" size="sm">
                            {metrics.logistic_regression?.precision >= metrics.random_forest?.precision ? 'Logistic Regression' : 'Random Forest'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-slate-900">Recall (Fraudulent Class)</td>
                        <td className="px-6 py-4 font-semibold text-blue-700">{((metrics.logistic_regression?.recall || 0) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 font-semibold text-indigo-700">{((metrics.random_forest?.recall || 0) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4">
                          <Badge variant="info" size="sm">
                            {metrics.logistic_regression?.recall >= metrics.random_forest?.recall ? 'Logistic Regression' : 'Random Forest'}
                          </Badge>
                        </td>
                      </tr>
                      <tr className="bg-blue-50/30">
                        <td className="px-6 py-4 font-bold text-slate-900">F1 Score (Primary Selection Criteria)</td>
                        <td className="px-6 py-4 font-bold text-blue-700">{((metrics.logistic_regression?.f1_score || 0) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 font-bold text-indigo-700">{((metrics.random_forest?.f1_score || 0) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4">
                          <Badge variant="genuine" size="sm">
                            Selected: {metrics.primary_model}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confusion Matrices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-3">Logistic Regression Confusion Matrix</h4>
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                      True Genuine: {metrics.logistic_regression?.confusion_matrix?.[0]?.[0] || 0}
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 text-rose-900 font-bold border border-rose-200">
                      False Fake: {metrics.logistic_regression?.confusion_matrix?.[0]?.[1] || 0}
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 text-rose-900 font-bold border border-rose-200">
                      False Genuine: {metrics.logistic_regression?.confusion_matrix?.[1]?.[0] || 0}
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                      True Fake: {metrics.logistic_regression?.confusion_matrix?.[1]?.[1] || 0}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-3">Random Forest Confusion Matrix</h4>
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                      True Genuine: {metrics.random_forest?.confusion_matrix?.[0]?.[0] || 0}
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 text-rose-900 font-bold border border-rose-200">
                      False Fake: {metrics.random_forest?.confusion_matrix?.[0]?.[1] || 0}
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 text-rose-900 font-bold border border-rose-200">
                      False Genuine: {metrics.random_forest?.confusion_matrix?.[1]?.[0] || 0}
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                      True Fake: {metrics.random_forest?.confusion_matrix?.[1]?.[1] || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Dataset Upload Manager */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Dataset CSV</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Upload a new CSV dataset to update training data at <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">dataset/fake_job_postings.csv</code>.
              The CSV must contain standard columns (<code className="text-blue-600">title, description, fraudulent, benefits, industry</code>) and the <code className="text-blue-600">fraudulent</code> column must contain only 0 or 1 values.
            </p>

            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Input */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
                <UploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <label className="block text-sm font-semibold text-slate-700 mb-1 cursor-pointer">
                  <span>Choose CSV Dataset File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-400 block">
                  {file ? `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : 'Max file size 50MB (.csv)'}
                </span>
              </div>

              {uploadError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Validation Failed</h5>
                    <p className="mt-0.5">{uploadError}</p>
                  </div>
                </div>
              )}

              {uploadResult && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{uploadResult.message}</span>
                  </div>
                  <ul className="space-y-1 list-disc list-inside text-emerald-800 font-medium">
                    <li>Saved to: <strong>dataset/{uploadResult.filename}</strong></li>
                    <li>Total Rows Parsed: <strong>{uploadResult.row_count?.toLocaleString()}</strong></li>
                    <li>Class Balance: <strong>{uploadResult.class_balance?.genuine?.toLocaleString()} Genuine</strong> / <strong>{uploadResult.class_balance?.fraudulent?.toLocaleString()} Fraudulent</strong></li>
                  </ul>

                  <div className="mt-4 pt-3 border-t border-emerald-200">
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-900 block mb-1">Command to Retrain Model:</span>
                    <div className="bg-slate-900 text-white font-mono p-3 rounded-xl flex items-center justify-between text-xs">
                      <code>{uploadResult.retrain_command}</code>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full py-3.5 px-4 gradient-btn rounded-xl flex items-center justify-center gap-2 font-semibold text-sm shadow-md disabled:opacity-50"
              >
                {uploading ? (
                  <Spinner size="sm" label="Validating and saving dataset..." />
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Validate & Upload Dataset</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Admin Confirm Record Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            As administrator, are you sure you want to delete prediction record #{deleteId}? This will remove the record across the system.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleAdminDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              {deleting ? <Spinner size="sm" /> : 'Delete System Entry'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPanel;
