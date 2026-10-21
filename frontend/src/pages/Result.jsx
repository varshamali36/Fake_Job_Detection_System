import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckCircle2, Info, ArrowLeft, RotateCcw, AlertCircle, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Badge from '../components/Badge';

const Result = () => {
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return <Navigate to="/predict" replace />;
  }

  const isGenuine = result.prediction === 'Genuine';
  const riskScore = result.risk_score || 0;
  const riskLevel = result.risk_level || 'Low';

  // Recharts probability data
  const probData = [
    { name: 'Genuine', value: (result.probabilities?.genuine || 0) * 100, color: '#16a34a' },
    { name: 'Suspicious', value: (result.probabilities?.suspicious || 0) * 100, color: '#e11d48' },
  ];

  // Risk Score Circle gauge stroke calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  const getGaugeColor = (score) => {
    if (score <= 30) return '#16a34a'; // Emerald
    if (score <= 60) return '#f59e0b'; // Amber
    return '#e11d48'; // Rose
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/predict"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Evaluate Another Job</span>
        </Link>
      </div>

      {/* Main Verdict Header Card */}
      <div
        className={`p-8 rounded-3xl border shadow-xl mb-8 transition-all ${
          isGenuine
            ? 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 border-emerald-700/50 text-white'
            : 'bg-gradient-to-br from-rose-900 via-rose-950 to-slate-900 border-rose-700/50 text-white'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isGenuine ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-rose-500/30'
              }`}
            >
              {isGenuine ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">AI Assessment Result</span>
                <Badge variant={isGenuine ? 'genuine' : 'suspicious'} size="sm">
                  {result.confidence_score}% Confidence
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {isGenuine ? '🟢 GENUINE JOB POSTING' : '🔴 SUSPICIOUS / FAKE JOB'}
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Evaluation for: <span className="font-semibold text-white">{result.job_details?.title || 'Submitted Job Posting'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={riskLevel.toLowerCase()} size="lg" className="px-4 py-2 text-base font-bold">
              Risk Level: {riskLevel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Gauge & Probability Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Risk Score Circular Gauge */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-base font-bold text-slate-900 mb-4">Composite Risk Score</h3>
          
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={getGaugeColor(riskScore)}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{riskScore}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">out of 100</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mt-2">
            Combines machine learning TF-IDF classification with heuristic rule-based scam indicators.
          </p>
        </div>

        {/* Recharts Probability Donut */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center">
          <h3 className="text-base font-bold text-slate-900 mb-4">ML Model Probabilities</h3>
          
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={probData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {probData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around w-full mt-2 pt-4 border-t border-slate-100 text-xs font-semibold">
            <span className="text-emerald-700">Genuine: {result.probabilities?.genuine ? (result.probabilities.genuine * 100).toFixed(1) : '0'}%</span>
            <span className="text-rose-700">Suspicious: {result.probabilities?.suspicious ? (result.probabilities.suspicious * 100).toFixed(1) : '0'}%</span>
          </div>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm mb-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">Risk Indicators & Contributing Factors</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {result.risk_factors?.length || 0} Factors Identified
          </span>
        </div>

        {result.risk_factors && result.risk_factors.length > 0 ? (
          <div className="space-y-4">
            {result.risk_factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{factor.factor}</span>
                  </h4>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed">{factor.explanation}</p>
                </div>
                <Badge variant="suspicious" size="sm" className="shrink-0">
                  +{factor.points} pts
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>No significant risk factors or scam patterns were detected in this posting.</span>
          </div>
        )}
      </div>

      {/* Positive Indicators Checklist */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm mb-8">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Positive Trust Indicators</h2>
        </div>

        {result.positive_indicators && result.positive_indicators.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.positive_indicators.map((indicator, idx) => (
              <li key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs font-semibold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{indicator}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">No explicit positive trust indicators recorded.</p>
        )}
      </div>

      {/* AI Risk Assessment Legal Disclaimer */}
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-4">
        <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <h4 className="font-bold text-amber-950 uppercase tracking-wider mb-1">AI-Based Risk Assessment Disclaimer</h4>
          <p>
            All predictions and risk scores generated by this system represent automated machine learning statistical evaluations and heuristic risk indicators only.
            Outputs do not constitute legal proof of fraud or legal determination. Always verify job offers independently directly with verified employer representatives.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Result;
