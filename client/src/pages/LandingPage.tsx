import { Link } from "react-router-dom";
import DotGrid from "../components/CinematicBackground";
import Spline from "@splinetool/react-spline";

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen w-full text-white overflow-x-hidden" style={{ background: "#000000" }}>

      {/* ── DOT GRID BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <DotGrid
          
          gap={15}
          baseColor="#271E37"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* All content above background */}
      <div className="relative" style={{ zIndex: 1 }}>

      {/* NAV */}
      <nav className=" top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <div className="flex items-center justify-between w-full max-w-4xl px-4 py-2.5 rounded-full border border-white/[0.08]"
          style={{ background: "rgba(22,18,16,0.92)", backdropFilter: "blur(24px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#c2410c,#ea580c)" }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">Vi-Notes</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#" className="px-4 py-1.5 text-sm font-semibold text-white rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}>Home</a>
            
            <a href="#features" className="px-4 py-1.5 text-sm text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5">
              Features
              <span className="ml-0.5 text-white/30">+</span>
            </a>
            
            <a href="#how" className="px-4 py-1.5 text-sm text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5">About</a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link to="/login" className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
              </svg>
            </Link>
            <Link to="/register"
              className="px-5 py-2 rounded-full text-sm font-bold text-black transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: "#ffffff", boxShadow: "0 2px 12px rgba(255,255,255,0.15)" }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="relative flex flex-col items-center justify-center text-center pt-24 pb-20 px-6 overflow-hidden">

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-800/40 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-6"
              style={{ background: "rgba(194,65,12,0.1)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              AI-Powered Writing Verification
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6">
              One platform built for{" "}
              <span className="italic" style={{ color: "#fb923c" }}>writing authenticity</span>
            </h1>
            <p className="text-base md:text-lg text-white/50 font-normal max-w-xl mx-auto mb-8 leading-relaxed">
              Verify human authorship through behavioral intelligence — beyond simple text detection.
              The new standard in content integrity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register"
                className="px-7 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#c2410c,#ea580c)", boxShadow: "0 0 32px rgba(194,65,12,0.35)" }}>
                Start Verifying Free
              </Link>

            </div>
          </div>

          {/* Hero Spline 3D */}
          <div className="relative z-10 w-full max-w-5xl mx-auto mt-16 rounded-2xl overflow-hidden border border-white/[0.07]"
            style={{ height: "500px", background: "rgba(0,0,0,0.4)" }}>
            <Spline scene="https://prod.spline.design/L2HbzZrv2gej8CgF/scene.splinecode" />
          </div>
        </section>

        {/* SOCIAL PROOF BAR */}
        <div className="border-y border-white/[0.06] py-5 px-6" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-8 text-xs text-white/30 font-medium tracking-widest uppercase">
            {["Universities", "Research Labs", "Enterprise Teams", "Content Platforms", "EdTech Companies"].map(name => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>

        {/* FEATURES — alternating layout */}
        <section id="features" className="py-24 px-6" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="max-w-6xl mx-auto space-y-28">

            {/* Feature 1 — text left, visual right */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#fb923c" }}>Behavioral Analysis</div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-5">
                  Typing patterns that<br />can't be faked
                </h2>
                <p className="text-white/50 leading-relaxed mb-6">
                  Every human writer has a unique behavioral fingerprint — keystroke timing, pause distribution,
                  correction patterns. Vi-Notes maps all of it in real time.
                </p>
                <ul className="space-y-3">
                  {["Keystroke cadence & rhythm analysis","Cognitive pause detection","Copy-paste & edit pattern tracking"].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#fb923c" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="p-6 space-y-3">
                  <div className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-4">Keystroke Timeline</div>
                  {[90,60,80,45,95,70,55,85].map((h, i) => (
                    <div key={i} className="flex items-end gap-1 h-16">
                      {Array.from({length: 20}).map((_, j) => (
                        <div key={j} className="flex-1 rounded-sm transition-all"
                          style={{ height: `${Math.random()*60+20}%`, background: j % 5 === i % 5 ? "rgba(251,146,60,0.7)" : "rgba(255,255,255,0.08)" }} />
                      ))}
                    </div>
                  )).slice(0,3)}
                  <div className="flex justify-between text-[10px] text-white/20 pt-1">
                    <span>0s</span><span>15s</span><span>30s</span><span>45s</span><span>60s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 — visual left, text right */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl border border-white/[0.07] overflow-hidden order-2 md:order-1"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="p-6">
                  <div className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-5">AI Detection Report</div>
                  <div className="space-y-4">
                    {[
                      { label: "Human Probability", val: 82, color: "#22c55e" },
                      { label: "AI Likelihood", val: 18, color: "#ef4444" },
                      { label: "Behavioral Score", val: 91, color: "#fb923c" },
                    ].map(({ label, val, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-white/50">{label}</span>
                          <span className="font-bold" style={{ color }}>{val}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-3 rounded-xl border border-green-500/20" style={{ background: "rgba(34,197,94,0.06)" }}>
                    <div className="text-xs font-bold text-green-400">✓ Verified Human Authorship</div>
                    <div className="text-[11px] text-white/30 mt-0.5">High confidence — behavioral patterns consistent</div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#fb923c" }}>AI Detection Engine</div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-5">
                  Beyond simple<br />text detection
                </h2>
                <p className="text-white/50 leading-relaxed mb-6">
                  State-of-the-art NLP models trained to spot the subtle linguistic artifacts of large language models,
                  combined with behavioral signals for unmatched accuracy.
                </p>
                <ul className="space-y-3">
                  {["Multi-layer NLP analysis","Perplexity & burstiness scoring","Cross-referenced behavioral data"].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#fb923c" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3 — text left, visual right */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#fb923c" }}>Real-Time Tracking</div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-5">
                  Live monitoring as<br />you write
                </h2>
                <p className="text-white/50 leading-relaxed mb-6">
                  Vi-Notes captures every keystroke event during the writing session, building a complete
                  behavioral timeline that proves authenticity from start to finish.
                </p>
                <ul className="space-y-3">
                  {["Session-level event recording","Tamper-evident audit trail","Instant verification reports"].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#fb923c" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/[0.07] overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="p-6">
                  <div className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-5">Live Session</div>
                  <div className="space-y-2.5">
                    {[
                      { time: "00:00", event: "Session started", type: "info" },
                      { time: "00:12", event: "First keystroke detected", type: "ok" },
                      { time: "01:34", event: "Pause pattern: natural (2.1s)", type: "ok" },
                      { time: "03:22", event: "Edit detected — human correction", type: "ok" },
                      { time: "05:10", event: "WPM: 64 — within normal range", type: "ok" },
                    ].map(({ time, event, type }) => (
                      <div key={time} className="flex items-start gap-3 text-xs">
                        <span className="text-white/25 font-mono w-10 flex-shrink-0 pt-0.5">{time}</span>
                        <span className={type === "ok" ? "text-green-400/80" : "text-white/40"}>{event}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400 font-semibold">Recording...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-24 px-6" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#fb923c" }}>How it works</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Simple. Powerful. Reliable.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Write Naturally", desc: "Open a document in Vi-Notes and write as you normally would. Our system runs silently in the background." },
                { step: "02", title: "Capture Behavior", desc: "Every keystroke, pause, and edit is recorded and analyzed against behavioral baselines in real time." },
                { step: "03", title: "Get Verified", desc: "Receive a tamper-evident report with a human authorship score, behavioral timeline, and full audit trail." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="p-6 rounded-2xl border border-white/[0.07] relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="text-5xl font-black mb-4 select-none" style={{ color: "rgba(251,146,60,0.12)" }}>{step}</div>
                  <h3 className="text-base font-bold mb-2">{title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="py-20 px-6 border-y border-white/[0.06]" style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#fb923c" }}>Intelligence Core</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Everything we detect,<br />working in harmony</h2>
              <p className="text-sm text-white/40 max-w-md mx-auto">Every signal feeds into a unified behavioral model that can't be fooled.</p>
            </div>

            {/* Spline + floating cards */}
            <div className="relative w-full mx-auto" style={{ height: "520px" }}>

              {/* Spline scene */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                <Spline scene="https://prod.spline.design/b-D699-VD-M604xb/scene.splinecode" />
                {/* overlay to block built-in Spline UI buttons */}
                <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-all" style={{ zIndex: 10, background: "transparent" }} />
              </div>

              {/* Floating signal cards */}

              {/* Top-left — Keystroke Cadence */}
              <div className="absolute top-8 left-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.1] backdrop-blur-md"
                style={{ background: "rgba(82,39,255,0.15)", boxShadow: "0 0 24px rgba(82,39,255,0.2)", animation: "float1 4s ease-in-out infinite" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(82,39,255,0.3)" }}>
                  <svg className="w-4 h-4" style={{ color: "#a78bfa" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Keystroke Cadence</div>
                  <div className="text-sm font-bold" style={{ color: "#a78bfa" }}>64 WPM</div>
                </div>
              </div>

              {/* Top-right — Pause Pattern */}
              <div className="absolute top-8 right-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.1] backdrop-blur-md"
                style={{ background: "rgba(251,146,60,0.12)", boxShadow: "0 0 24px rgba(251,146,60,0.15)", animation: "float2 5s ease-in-out infinite" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,146,60,0.25)" }}>
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Pause Pattern</div>
                  <div className="text-sm font-bold text-orange-400">Natural 2.1s</div>
                </div>
              </div>

              {/* Middle-left — Edit Ratio */}
              <div className="absolute left-4 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.1] backdrop-blur-md" style={{ top: "45%", background: "rgba(34,197,94,0.1)", boxShadow: "0 0 24px rgba(34,197,94,0.15)", animation: "float3 6s ease-in-out infinite" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.2)" }}>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Edit Ratio</div>
                  <div className="text-sm font-bold text-green-400">12% — Human</div>
                </div>
              </div>

              {/* Middle-right — Paste Detection */}
              <div className="absolute right-4 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.1] backdrop-blur-md" style={{ top: "45%", background: "rgba(239,68,68,0.1)", boxShadow: "0 0 24px rgba(239,68,68,0.15)", animation: "float1 4.5s ease-in-out infinite" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.2)" }}>
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Paste Detection</div>
                  <div className="text-sm font-bold text-red-400">0% Pasted</div>
                </div>
              </div>

              {/* Bottom-left — Authenticity Score */}
              <div className="absolute bottom-8 left-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.1] backdrop-blur-md"
                style={{ background: "rgba(82,39,255,0.15)", boxShadow: "0 0 24px rgba(82,39,255,0.2)", animation: "float2 5.5s ease-in-out infinite" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(82,39,255,0.3)" }}>
                  <svg className="w-4 h-4" style={{ color: "#a78bfa" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Auth Score</div>
                  <div className="text-sm font-bold" style={{ color: "#a78bfa" }}>82% Human</div>
                </div>
              </div>

              {/* Bottom-right — Session Live */}
              <div className="absolute bottom-8 right-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.1] backdrop-blur-md"
                style={{ background: "rgba(34,197,94,0.1)", boxShadow: "0 0 24px rgba(34,197,94,0.15)", animation: "float3 4s ease-in-out infinite" }}>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Session</div>
                  <div className="text-sm font-bold text-green-400">Live Recording</div>
                </div>
              </div>

            </div>
          </div>

          {/* Float keyframes */}
          <style>{`
            @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
            @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
            @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          `}</style>
        </section>

        {/* TESTIMONIAL / CTA BANNER */}
        <section className="py-20 px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-white/[0.07] p-10 md:p-14 text-center relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 100%, rgba(194,65,12,0.15), transparent 60%)" }} />
              <div className="relative z-10">
                <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#fb923c" }}>Get Started Today</div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5">
                  The future of writing<br />verification is here
                </h2>
                <p className="text-white/45 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
                  Join thousands of educators, researchers, and content teams who trust Vi-Notes to verify human authorship.
                </p>
                <Link to="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#c2410c,#ea580c)", boxShadow: "0 0 40px rgba(194,65,12,0.4)" }}>
                  Start Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-14 px-6" style={{ background: "rgba(0,0,0,0.85)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="text-base font-bold text-white mb-3">Vi-Notes</div>
            <p className="text-xs text-white/30 leading-relaxed max-w-xs">
              Advancing the standard of human authenticity in the age of intelligence.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">Product</div>
            <ul className="space-y-3">
              {["Features","Pricing","Integrations","Changelog"].map(l => (
                <li key={l}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">Company</div>
            <ul className="space-y-3">
              {["About","Blog","Careers","Contact"].map(l => (
                <li key={l}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">Legal</div>
            <ul className="space-y-3">
              {["Privacy","Terms","Security"].map(l => (
                <li key={l}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/20">© 2026 Vi-Notes. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/25">All systems operational</span>
          </div>
        </div>
      </footer>
      </div>{/* end content wrapper */}
    </div>
  );
}
