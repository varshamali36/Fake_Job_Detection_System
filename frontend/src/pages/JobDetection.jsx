import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Send, Sparkles, Building2, Briefcase, FileText, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const SAMPLE_GENUINE = {
  title: "Senior Full Stack Software Engineer",
  company_profile: "Nexus Tech is a leading cloud enterprise software firm with over 600 employees globally.",
  description: "We are seeking an experienced Full Stack Engineer to build scalable microservices using Python, React, and PostgreSQL. You will collaborate with cross-functional product teams.",
  requirements: "Bachelor's degree in Computer Science, 4+ years Python/React experience, Docker & Kubernetes knowledge.",
  benefits: "Health & Dental Insurance, 401(k) matching, 25 days PTO, hybrid remote flexibility.",
  employment_type: "Full-time",
  required_experience: "Mid-Senior level",
  required_education: "Bachelor's Degree",
  industry: "Computer Software",
  function: "Engineering",
  salary_range: "$110,000 - $140,000",
  location: "San Francisco, CA",
  has_company_logo: true
};

const SAMPLE_SCAM = {
  title: "Data Entry Assistant - $5000/Week - Immediate Hiring",
  company_profile: "Offshore financial team offering quick income.",
  description: "Earn massive income from home! Work 1 hour per day processing wire transfers and handling customer checks. Contact us via Telegram or WhatsApp immediately.",
  requirements: "No experience needed. Must pay $50 application registration fee for starter kit.",
  benefits: "Daily cash payout, work 1 hour a day, $1000 weekly bonus.",
  employment_type: "Part-time",
  required_experience: "Entry level",
  required_education: "Unspecified",
  industry: "Customer Service",
  function: "Financial",
  salary_range: "$5,000/week",
  location: "Remote / Work From Home",
  has_company_logo: false
};

const JobDetection = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: '',
    company_profile: '',
    description: '',
    requirements: '',
    benefits: '',
    employment_type: 'Full-time',
    required_experience: 'Mid-Senior level',
    required_education: "Bachelor's Degree",
    industry: '',
    function: '',
    salary_range: '',
    location: '',
    has_company_logo: true
  });

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Please enter a job title.';
    if (!form.description.trim()) errs.description = 'Please enter a job description.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/predict', form);
      showSuccess('Job posting evaluated successfully!');
      navigate('/result', { state: { result: res.data } });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to analyze job posting. Please check inputs.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setForm(sample);
    setErrors({});
    showSuccess('Sample job details loaded!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Risk Assessment</h1>
          <p className="text-sm text-slate-600 mt-1">Paste a job posting below for instant AI and rule-based scam detection</p>
        </div>

        {/* Quick Fill Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadSample(SAMPLE_GENUINE)}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Load Genuine Sample</span>
          </button>
          <button
            type="button"
            onClick={() => loadSample(SAMPLE_SCAM)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Load Scam Sample</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Job Basic Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">1. Job Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.title ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Employment Type
              </label>
              <select
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Salary Range
              </label>
              <input
                type="text"
                value={form.salary_range}
                onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
                placeholder="e.g. $90,000 - $120,000 or $5000/week"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Industry
              </label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="e.g. Computer Software, Healthcare"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Job Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Paste the full job description here..."
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.description ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.description && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Company Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">2. Company Information</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Company Profile Overview
              </label>
              <textarea
                rows={3}
                value={form.company_profile}
                onChange={(e) => setForm({ ...form, company_profile: e.target.value })}
                placeholder="Overview of the company, mission, or company background..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="has_logo"
                checked={form.has_company_logo}
                onChange={(e) => setForm({ ...form, has_company_logo: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="has_logo" className="text-sm font-medium text-slate-700 cursor-pointer">
                Job posting includes a verified company logo asset
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Requirements & Benefits */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">3. Requirements & Benefits</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Required Experience Level
              </label>
              <select
                value={form.required_experience}
                onChange={(e) => setForm({ ...form, required_experience: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Entry level">Entry level</option>
                <option value="Associate">Associate</option>
                <option value="Mid-Senior level">Mid-Senior level</option>
                <option value="Director">Director</option>
                <option value="Executive">Executive</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Required Education
              </label>
              <select
                value={form.required_education}
                onChange={(e) => setForm({ ...form, required_education: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="High School or equivalent">High School or equivalent</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Unspecified">Unspecified</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Job Requirements & Qualifications
              </label>
              <textarea
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder="Skills, qualifications, and required experience..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Perks & Benefits
              </label>
              <textarea
                rows={3}
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                placeholder="Insurance, PTO, bonuses, remote perks..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 gradient-btn rounded-xl flex items-center gap-2.5 font-bold text-base shadow-lg shadow-blue-500/20 disabled:opacity-60"
          >
            {loading ? (
              <Spinner size="sm" label="Analyzing posting..." />
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Analyze Job Posting Risk</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobDetection;
