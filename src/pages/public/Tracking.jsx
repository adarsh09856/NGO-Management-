import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, CheckCircle2, Clock, Shield, Download, AlertCircle, ArrowRight, Flame, Heart, FileText } from 'lucide-react';
import api from '../../services/api';

export default function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [query, setQuery] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTracking = async (trackingQuery) => {
    const q = (trackingQuery || '').trim();
    if (!q || q.length < 3) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get(`/tracking/${encodeURIComponent(q)}`);
      if (res.data?.success && res.data.data) {
        setResult(res.data.data);
      } else {
        setResult(null);
        setErrorMsg('No offering or prayer record found for this tracking reference.');
      }
    } catch (err) {
      setResult(null);
      setErrorMsg(err.response?.data?.message || 'Unable to locate tracking record. Please verify your reference.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTracking(initialId);
    }
  }, [initialId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ id: query.trim() });
      fetchTracking(query.trim());
    }
  };

  return (
    <div className="min-h-[85vh] py-10 sm:py-16 px-3 xs:px-4 sm:px-8 relative z-10 max-w-4xl mx-auto space-y-8 sm:space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 sm:space-y-4 animate-fade-in-up">
        <div className="inline-flex items-center space-x-2 glow-pill-gold px-3.5 py-1.5 rounded-full text-xs font-bold animate-float">
          <Shield className="w-4 h-4 text-amber-600" />
          <span className="font-tibetan text-sm">༄༅། །རྗེས་འདེད་ལྟ་རྟོགས།</span>
          <span>• Monastic Treasury Reconciliation Ledger</span>
        </div>
        <h1 className="font-serif-brand font-extrabold text-2xl xs:text-3xl sm:text-5xl text-[#0F172A] tracking-wide break-words">
          Live Offering & Prayer Tracking
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto font-light leading-relaxed">
          Track the real-time status of your sacred Dana offering or prayer request through our multi-step monastic treasury verification, bank statement audit, and Section 80G statutory certification.
        </p>
      </div>

      {/* Search Bar Form */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl shadow-xl border border-[#D4AF37]/40 p-4 sm:p-6 max-w-2xl mx-auto animate-scale-in">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Tracking ID (TRK-...), Receipt No, or 12-Digit UTR..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="monastic-maroon-btn px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md flex-shrink-0"
          >
            <span>{loading ? 'Locating...' : 'Track Status'}</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 space-y-3">
          <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 font-serif">Querying Monastic Ledger & Bank Reconciliation Logs...</p>
        </div>
      )}

      {/* Error State */}
      {errorMsg && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 max-w-2xl mx-auto text-center space-y-2 animate-fadeIn">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <h4 className="text-sm font-bold text-red-900 font-serif">Record Not Found</h4>
          <p className="text-xs text-red-700 leading-relaxed max-w-md mx-auto">
            {errorMsg}
          </p>
          <div className="pt-2 text-[11px] text-gray-500">
            Tip: You can search by your <strong>Tracking ID</strong> (e.g. <code>TRK-2026-XXXXX</code>), your <strong>Provisional Receipt No</strong>, or your <strong>12-digit UPI UTR</strong>.
          </div>
        </div>
      )}

      {/* Tracking Result Card & Timeline */}
      {result && !loading && (
        <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
          {/* Top Status Summary Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl border border-[#D4AF37]/50 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#721C24] bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {result.category}
                </span>
                <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#1A0B0E] mt-1.5">
                  {result.cause}
                </h3>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-500 block font-serif">Offering Amount</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono">
                  {result.currency} {result.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF5F0] p-4 rounded-2xl border border-[#D4AF37]/25 font-sans">
              <div>
                <span className="text-[10.5px] text-gray-500 block">Tracking ID:</span>
                <span className="font-bold text-gray-900 font-mono text-[11.5px] select-all">{result.trackingId}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-gray-500 block">Submitted UTR:</span>
                <span className="font-mono text-gray-900 font-bold">{result.transactionRefMasked}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-gray-500 block">Devotee:</span>
                <span className="font-semibold text-gray-900">{result.donorNameMasked}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-gray-500 block">Live Status:</span>
                {result.isVerified ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled & Certified
                  </span>
                ) : (
                  <span className="text-amber-800 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending Audit
                  </span>
                )}
              </div>
            </div>

            {/* Visual 4-Step Milestone Progress Timeline */}
            <div className="pt-2 space-y-6">
              <h4 className="font-editorial text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Verification Progress Timeline</span>
              </h4>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#D4AF37] before:via-amber-400 before:to-gray-200">
                {result.timeline.map((step) => {
                  const isDone = step.status === 'completed';
                  const isInProgress = step.status === 'in_progress';

                  return (
                    <div key={step.step} className="relative group">
                      {/* Step Indicator Pin */}
                      <div className={`absolute -left-6 sm:-left-8 top-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                        isDone
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : isInProgress
                          ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.step}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h5 className={`font-serif text-sm font-bold ${
                            isDone ? 'text-gray-900' : isInProgress ? 'text-amber-900 font-extrabold' : 'text-gray-400'
                          }`}>
                            {step.title}
                          </h5>
                          {step.timestamp && (
                            <span className="text-[10px] text-gray-500 font-mono">
                              {new Date(step.timestamp).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${
                          isDone ? 'text-gray-600' : isInProgress ? 'text-amber-900' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions & Certified PDF Download */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
              {result.pdfDownloadUrl ? (
                <a
                  href={result.pdfDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="monastic-maroon-btn w-full sm:w-auto px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4 text-[#D4AF37]" />
                  <span>Download Official Section 80G Tax Receipt (PDF)</span>
                </a>
              ) : (
                <div className="text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 w-full flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Reconciliation in progress:</strong> Your official Section 80G tax receipt PDF and blessed dedication letter will be unlocked here and sent to your email as soon as the treasury verifies your payment.
                  </span>
                </div>
              )}

              <Link
                to="/donate"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold text-center transition-colors"
              >
                Offer Another Dana
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
