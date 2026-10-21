import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, BarChart2, PieChart as PieIcon, LineChart as LineIcon, Key, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <Spinner size="lg" label="Loading analytics dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState title="Dashboard Error" message={error} onRetry={fetchDashboard} />
      </div>
    );
  }

  const hasData = data && data.total_analyzed > 0;

  // Chart Data Preparation
  const donutData = hasData ? [
    { name: 'Genuine', value: data.genuine_count, color: '#16a34a' },
    { name: 'Suspicious', value: data.fake_count, color: '#e11d48' }
  ] : [];

  const riskBarData = hasData ? [
    { level: 'Low Risk', count: data.risk_distribution?.Low || 0, fill: '#16a34a' },
    { level: 'Medium Risk', count: data.risk_distribution?.Medium || 0, fill: '#f59e0b' },
    { level: 'High Risk', count: data.risk_distribution?.High || 0, fill: '#e11d48' }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">Overview of your job risk evaluations and detection patterns</p>
        </div>

        <Link
          to="/predict"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-btn text-sm font-semibold shadow-md shadow-blue-500/20"
        >
          <Search className="w-4 h-4" />
          <span>Check New Job</span>
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Evaluated</span>
          <span className="text-3xl font-extrabold text-slate-900">{data?.total_analyzed || 0}</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">Genuine Jobs</span>
          <span className="text-3xl font-extrabold text-emerald-600">{data?.genuine_count || 0}</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">Suspicious / Fake</span>
          <span className="text-3xl font-extrabold text-rose-600">{data?.fake_count || 0}</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Avg Risk Score</span>
          <span className="text-3xl font-extrabold text-slate-900">{data?.avg_risk_score || 0}<span className="text-sm text-slate-400 font-normal">/100</span></span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">High Risk Count</span>
          <span className="text-3xl font-extrabold text-rose-600">{data?.high_risk_count || 0}</span>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="No Detection Analytics Yet"
          message="Submit your first job posting to populate dashboard charts, risk breakdowns, and trend history."
          action={
            <Link
              to="/predict"
              className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Analyze Your First Job
            </Link>
          }
        />
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Chart 1: Genuine vs Fake Donut */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <PieIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Genuine vs. Suspicious Ratio</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Risk Level Distribution Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Risk Level Distribution</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskBarData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="level" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {riskBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Predictions Over Time Line */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <LineIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">30-Day Evaluation Trend</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.predictions_over_time || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="genuine" stroke="#16a34a" strokeWidth={2} name="Genuine" />
                    <Line type="monotone" dataKey="fake" stroke="#e11d48" strokeWidth={2} name="Suspicious" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Top Suspicious Keywords */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Key className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Top Flagged Risk Indicators</h3>
              </div>
              {data?.top_keywords && data.top_keywords.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.top_keywords}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="keyword" width={140} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#e11d48" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                  No suspicious keywords flagged in recent jobs.
                </div>
              )}
            </div>
          </div>

          {/* Recent Evaluations Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">10 Most Recent Evaluations</h3>
              <Link to="/history" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                <span>View Full History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Job Title</th>
                    <th className="px-6 py-3.5">Verdict</th>
                    <th className="px-6 py-3.5">Confidence</th>
                    <th className="px-6 py-3.5">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recent_predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
