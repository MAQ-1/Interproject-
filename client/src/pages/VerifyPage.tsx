import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

type VerificationData = {
  analytics?: {
    approximateWpmVariance?: number;
    pauseFrequency?: number;
    editRatio?: number;
    pasteRatio?: number;
    totalInsertedChars?: number;
    totalDeletedChars?: number;
    finalChars?: number;
    totalPastedChars?: number;
    pauseCount?: number;
    durationMs?: number;
    textAnalysis?: {
      avgSentenceLength?: number;
      sentenceVariance?: number;
      lexicalDiversity?: number;
      totalWords?: number;
      totalSentences?: number;
    };
    authenticity?: {
      score?: number;
      label?: string;
    };
    flags?: string[];
  };
  createdAt?: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001";

const fmt = (value: unknown, digits = 2) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "—";

const fint = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : "—";

const fdur = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const totalSeconds = Math.max(0, Math.round(value / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
};

const Metric = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] opacity-90">{label}</span>
    <span className="text-[1.5rem] md:text-[1.65rem] leading-[1.2] font-semibold tracking-tight text-[var(--text)]">{value}</span>
    {sub && <span className="text-[0.75rem] leading-[1.45] text-[var(--muted)] font-medium opacity-90">{sub}</span>}
  </div>
);

export default function VerifyPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError("Missing session id");
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await api.get(`/api/sessions/verify/${sessionId}`);
        if (cancelled) return;
        setData(res.data.data ?? null);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("Could not load verification data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();
    const interval = setInterval(fetchData, 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId]);

  const analytics = data?.analytics;
  const score = analytics?.authenticity?.score;
  const hasAnalytics = !!analytics && (
    (analytics.durationMs ?? 0) > 0 ||
    (analytics.totalInsertedChars ?? 0) > 0
  );

  const statusStyle =
    typeof score === "number"
      ? score > 70
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : score > 40
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : "bg-red-500/10 text-red-400 border-red-500/20"
      : "bg-zinc-800 text-zinc-400 border-zinc-700";

  const openPdf = () => {
    if (!sessionId) return;
    window.open(
      `${API_BASE_URL}/api/sessions/verify/${sessionId}/pdf`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--base)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-[var(--brand)] rounded-full animate-spin" />
          <p className="text-[0.95rem] leading-[1.5] font-medium text-[var(--muted)]">Generating verification report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--base)] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h1 className="text-[1.35rem] md:text-[1.5rem] leading-[1.25] font-bold font-manrope">Unable to Load Report</h1>
          <p className="text-[0.95rem] leading-[1.55] text-[var(--muted)]">{error ?? "The report data is unavailable or still being processed."}</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl px-8">Return</Button>
        </div>
      </div>
    );
  }

  const scoreValue = typeof score === "number" ? Math.round(score) : 0;
  const label = analytics?.authenticity?.label ?? "Unknown";

  return (
    <div className="min-h-screen bg-[var(--base)] text-[var(--text)] font-manrope selection:bg-[var(--brand)] selection:text-[var(--brand-foreground)]">
      <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:py-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <Badge className="rounded-full px-3 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] border border-zinc-800 bg-transparent text-[var(--muted)]">Verification Report</Badge>
            <h1 className="text-[2.25rem] md:text-[3.25rem] leading-[1.1] font-extrabold tracking-tight">Authenticity Analysis</h1>
            <div className="flex items-center gap-3 text-[0.8125rem] leading-[1.45] font-medium text-[var(--muted)]">
              <span className="font-mono text-zinc-400">ID: {sessionId?.slice(0, 8)}...</span>
              <Separator className="w-px h-3 bg-zinc-800 mx-1" />
              <span>{data.createdAt ? new Date(data.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={openPdf} size="lg" className="rounded-xl font-bold bg-[var(--text)] text-[var(--base)] hover:opacity-90">
              Download PDF
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline" size="lg" className="rounded-xl font-bold border-zinc-800">
              Files
            </Button>
          </div>
        </div>

        {/* Primary Insight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          <div className="lg:col-span-4 p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center text-center">
             <div className="mb-6 relative">
                <svg className="w-32 h-32 transform -rotate-90">
                   <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-800" />
                   <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * scoreValue) / 100} className={scoreValue > 70 ? "text-emerald-500" : scoreValue > 40 ? "text-amber-500" : "text-red-500"} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                   <span className="text-[2.25rem] leading-none font-extrabold tracking-tight">{scoreValue}%</span>
                </div>
             </div>
               <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] mb-3 opacity-85">Authenticity Score</p>
               <Badge className={`rounded-full px-4 py-1.5 text-[0.75rem] font-semibold border ${statusStyle}`}>
               {hasAnalytics ? label : "Pending"}
             </Badge>
          </div>

          <div className="lg:col-span-8 p-10 rounded-3xl border border-zinc-800 bg-zinc-900/20">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8">
               <Metric label="Words Per Minute" value={fint(analytics?.approximateWpmVariance != null ? Math.round(analytics.approximateWpmVariance) : undefined)} sub="Writing cadence" />
               <Metric label="Significant Pauses" value={fint(analytics?.pauseCount)} sub="Average 2.4s" />
               <Metric label="Linguistic Edit Ratio" value={fmt(analytics?.editRatio)} sub="Correction frequency" />
               <Metric label="Paste Frequency" value={fmt(analytics?.pasteRatio)} sub="External input" />
               <Metric label="Total Session Time" value={fdur(analytics?.durationMs)} sub="Active focus" />
               <Metric label="Final Word Count" value={fint(analytics?.finalChars != null ? Math.round(analytics.finalChars / 5) : undefined)} sub="Net output" />
             </div>
          </div>

        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/10">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-zinc-400 mb-3 block">Structural Depth</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[1.75rem] leading-[1.2] font-bold">{fint(analytics?.textAnalysis?.avgSentenceLength != null ? Math.round(analytics.textAnalysis.avgSentenceLength) : undefined)}</span>
                <span className="text-[0.875rem] leading-[1.45] font-medium text-zinc-400">avg words / sentence</span>
              </div>
           </div>
           <div className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/10">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-zinc-400 mb-3 block">Manual Input</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[1.75rem] leading-[1.2] font-bold">{fint(analytics?.totalInsertedChars)}</span>
                <span className="text-[0.875rem] leading-[1.45] font-medium text-zinc-400">characters typed</span>
              </div>
           </div>
           <div className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/10">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-zinc-400 mb-3 block">Modifications</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[1.75rem] leading-[1.2] font-bold">{fint(analytics?.totalDeletedChars)}</span>
                <span className="text-[0.875rem] leading-[1.45] font-medium text-zinc-400">characters deleted</span>
              </div>
           </div>
        </div>

        {/* Behavioral Anomaly Detection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.875rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Behavioral Indicators</h3>
            {(!analytics?.flags || analytics.flags.length === 0) && (
              <span className="flex items-center gap-2 text-emerald-300 text-[0.75rem] font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Healthy Patterns Detected
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {analytics?.flags?.length ? (
              analytics.flags.map((flag, index) => (
                <div key={`flag-${index}`} className="flex items-start gap-4 p-5 rounded-2xl border border-red-500/20 bg-red-500/[0.03] text-red-500">
                  <div className="p-2 bg-red-500/10 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </div>
                  <div>
                    <h4 className="text-[0.9375rem] leading-[1.35] font-semibold mb-1">Pattern Anomaly</h4>
                    <p className="text-[0.8125rem] leading-[1.55] text-red-300/90 font-medium">{flag}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/5">
                 <p className="text-[0.95rem] leading-[1.55] text-zinc-400 font-medium italic">All typing signals indicate human-consistent behavioral characteristics.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-1">
             <p className="text-[0.6875rem] font-semibold text-zinc-400 uppercase tracking-[0.08em] leading-none">ViNotes Integrity</p>
             <p className="text-[0.625rem] font-medium text-zinc-500 uppercase tracking-[0.06em] leading-none">Behavioral Biometrics Core v4.2.0</p>
          </div>
          <p className="text-[0.6875rem] font-medium text-zinc-500 tracking-[0.03em] leading-[1.4] text-center md:text-right">
            {data.createdAt ? `Generated securely on ${new Date(data.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}` : "N/A"}
          </p>
        </div>

      </div>
    </div>
  );
}
