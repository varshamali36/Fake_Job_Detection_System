import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, Cpu, CheckCircle2, AlertTriangle, Layers, ArrowRight, BarChart3, Database } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner';

const Home = () => {
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/metrics');
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed to load metrics:", err);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-6 border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>AI & Machine Learning Powered Protection</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Detect Fake Jobs <span className="gradient-text">Before You Apply</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Use AI and Machine Learning to analyze job postings and identify suspicious recruitment patterns, upfront fee requests, and fraudulent offers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/predict"
              className="w-full sm:w-auto px-8 py-4 rounded-xl gradient-btn flex items-center justify-center gap-2.5 text-base font-semibold shadow-lg shadow-blue-600/25"
            >
              <Search className="w-5 h-5" />
              <span>Check a Job Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Real API Metrics Stat Section */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trained Model Performance Stats</h3>
          </div>

          {loadingMetrics ? (
            <div className="py-6 flex justify-center">
              <Spinner label="Loading real evaluation metrics..." />
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <Database className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <span className="block text-2xl font-extrabold text-slate-900">{metrics.total_rows?.toLocaleString() || '17,880'}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Training Postings ({metrics.dataset_name})</span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <BarChart3 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <span className="block text-2xl font-extrabold text-emerald-600">
                  {((metrics.logistic_regression?.accuracy || 0) * 100).toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Accuracy</span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <Cpu className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <span className="block text-2xl font-extrabold text-indigo-600">
                  {((metrics.logistic_regression?.f1_score || 0) * 100).toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Model F1-Score</span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <span className="block text-2xl font-extrabold text-slate-900">{metrics.primary_model || 'LogisticRegression'}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Winning ML Classifier</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">Run `python backend/ml/train_model.py` to populate live metrics.</p>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Three fast steps to protect yourself from recruitment scams and unverified job offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Paste Job Posting</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Provide details like title, company description, requirements, salary, and contact information into our structured form.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dual ML & Rule Analysis</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our scikit-learn TF-IDF classifier works alongside custom heuristic rules to flag suspicious terms, fee requests, and anomalies.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Risk Assessment</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Receive a clear verdict (Genuine vs. Suspicious), a 0-100 risk score, probabilities, and an itemized breakdown of risk factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Fake Job Detection System — MCA Final Year Academic Project.</p>
          <p className="mt-1 text-slate-500">
            Disclaimer: All outputs generated by this system represent AI-based risk assessments and automated risk indicators only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
