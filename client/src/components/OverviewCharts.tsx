import { useState, useEffect } from "react";

interface Session {
  id: string;
  wpm: number;
  duration: number | string;
  words: number;
}

interface OverviewChartsProps {
  avgWpm: number;
  totalWords: number;
  totalSessions: number;
  totalDuration: number;
  sessions: Session[];
  fileName: string;
  lastModified: number;
}

const MetricBox = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex-1 min-w-[140px]">
    <div className="text-[0.6875rem] uppercase tracking-[0.08em] text-white/60 font-semibold mb-2">{label}</div>
    <div className="text-[2rem] md:text-[2.25rem] leading-[1.1] font-black text-white tracking-tight transition-all hover:text-[#FF8C42] cursor-default">{value}</div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0">
    <span className="text-[0.875rem] leading-[1.45] text-white/65 font-medium">{label}</span>
    <span className="text-[0.875rem] leading-[1.45] text-white/95 font-semibold tracking-tight text-right">{value}</span>
  </div>
);

export const OverviewAnalyticsHero = ({
  avgWpm,
  totalWords,
  totalSessions,
  totalDuration,
  sessions,
  fileName,
  lastModified,
}: OverviewChartsProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const lastSession = sessions[sessions.length - 1];

  return (
    <div
      className={`space-y-16 transition-all duration-500 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
    >
      {/* 1. PRIMARY METRICS BAR - FULL WIDTH STRETCH */}
      <div className="flex flex-wrap items-center justify-between gap-12 pb-12 border-b border-white/5">
        <MetricBox label="Avg WPM" value={avgWpm} />
        <MetricBox label="Total Words" value={totalWords.toLocaleString()} />
        <MetricBox label="Sessions" value={totalSessions} />
        <MetricBox
          label="Total Duration"
          value={`${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`}
        />
      </div>

      {/* 2. BALANCED DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-16 lg:gap-24 items-start">
        {/* LEFT: DOCUMENT DETAILS */}
        <div className="space-y-8">
          <h3 className="text-[0.6875rem] uppercase tracking-[0.08em] text-white/70 font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
            Document Details
          </h3>
          <div className="space-y-1 pr-8">
            <DetailRow label="Resource ID" value={fileName.toUpperCase()} />
            <DetailRow label="Last Synced" value={new Date(lastModified).toLocaleDateString(undefined, { dateStyle: 'long' })} />
            <DetailRow label="Sync Time" value={new Date(lastModified).toLocaleTimeString()} />
          </div>
        </div>

        {/* RIGHT: LAST SESSION HIGHLIGHTS */}
        {lastSession && (
          <div className="space-y-8">
            <h3 className="text-[0.6875rem] uppercase tracking-[0.08em] text-[#FF8C42]/80 font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]/40" />
              Latest Session
            </h3>
            <div className="grid grid-cols-3 gap-6 md:gap-10 p-6 md:p-8 rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl">
              <div className="space-y-1.5 px-2">
                <div className="text-[0.625rem] text-white/60 font-semibold uppercase tracking-[0.08em]">Words</div>
                <div className="text-[1.35rem] md:text-[1.5rem] leading-[1.15] font-black text-white tracking-tight">{lastSession.words}</div>
              </div>
              <div className="space-y-1.5 px-2 border-l border-white/5">
                <div className="text-[0.625rem] text-white/60 font-semibold uppercase tracking-[0.08em]">WPM</div>
                <div className="text-[1.35rem] md:text-[1.5rem] leading-[1.15] font-black text-white tracking-tight">{lastSession.wpm}</div>
              </div>
              <div className="space-y-1.5 px-2 border-l border-white/5">
                <div className="text-[0.625rem] text-white/60 font-semibold uppercase tracking-[0.08em]">Time</div>
                <div className="text-[1.35rem] md:text-[1.5rem] leading-[1.15] font-black text-white tracking-tight">{lastSession.duration}s</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
