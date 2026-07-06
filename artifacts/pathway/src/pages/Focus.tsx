import { useEffect, useRef, useState } from "react";
import { useSearch, useLocation } from "wouter";
import Footer from "../components/Footer";
import { useFocusTimer } from "../hooks/useFocusTimer";

const CIRCUMFERENCE = 2 * Math.PI * 108;
const WATER_LOG_KEY = "pathway:waterLog";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function logWaterGlass(): void {
  let raw: Record<string, number> = {};
  try {
    raw = JSON.parse(localStorage.getItem(WATER_LOG_KEY) || "{}");
  } catch {}
  const key = todayKey();
  raw[key] = (raw[key] || 0) + 1;
  localStorage.setItem(WATER_LOG_KEY, JSON.stringify(raw));
}

function formatTime(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60).toString().padStart(2, "0");
  const s = Math.floor(Math.max(0, sec) % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Focus() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const rawLen = params.get("len") ? parseInt(params.get("len")!, 10) : null;
  const requestedLen = rawLen !== null && [5, 15, 25, 50].includes(rawLen) ? rawLen : null;

  const {
    running,
    phase,
    round,
    focusMinutes,
    totalSeconds,
    remainingSeconds,
    streak,
    lastCompletion,
    start,
    pause,
    reset,
    skip,
    applyLength,
  } = useFocusTimer();

  const [showStudyToast, setShowStudyToast] = useState(false);
  const [showWaterToast, setShowWaterToast] = useState(false);
  const [, navigate] = useLocation();
  const lastHandledCompletionAt = useRef<number | null>(null);

  const phaseIsWork = phase === "work";
  const ringOffset = CIRCUMFERENCE * (1 - remainingSeconds / Math.max(totalSeconds, 1));

  // apply an explicit ?len= request once on mount, without clobbering an
  // already in-flight session when the user simply navigates back here
  useEffect(() => {
    if (requestedLen !== null) applyLength(requestedLen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lastCompletion) return;
    if (lastCompletion.at === lastHandledCompletionAt.current) return;
    lastHandledCompletionAt.current = lastCompletion.at;

    if (lastCompletion.phase === "work") {
      setShowStudyToast(true);
      if (lastCompletion.checkWater) setShowWaterToast(true);
    }
  }, [lastCompletion]);

  useEffect(() => {
    const label = running
      ? `${formatTime(remainingSeconds)} · ${phase === "work" ? "Focusing" : "Break"} — ADHDrive`
      : "Focus — ADHDrive";
    document.title = label;
  }, [running, remainingSeconds, phase]);

  useEffect(() => {
    return () => {
      document.title = "ADHDrive";
    };
  }, []);

  const strokeColor = phaseIsWork ? "var(--color-clay)" : "var(--color-sage)";

  return (
    <div className="min-h-[100dvh] w-full bg-paper flex flex-col items-center justify-center px-4 py-12 relative">
      <button
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 text-ink-soft hover:text-ink text-sm font-medium flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-paper-raised"
        data-testid="link-back"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        ← Back
      </button>

      <div
        className="card-container flex flex-col items-center gap-6 text-center"
        style={{ maxWidth: 420 }}
        data-testid="focus-card"
      >
        {/* Eyebrow */}
        <p
          className="text-xs font-semibold tracking-widest uppercase transition-colors duration-300"
          style={{ color: phaseIsWork ? "var(--color-clay)" : "var(--color-sage)" }}
          data-testid="text-phase-label"
        >
          {phaseIsWork ? "Focus session" : "Break — step away"}
        </p>

        {/* Ring timer */}
        <div className="relative w-[240px] h-[240px]" data-testid="ring-container">
          <svg
            className="w-full h-full"
            viewBox="0 0 240 240"
            style={{ transform: "rotate(-90deg)" }}
            aria-hidden="true"
          >
            <circle
              cx="120" cy="120" r="108"
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="10"
            />
            <circle
              cx="120" cy="120" r="108"
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span
              className="font-serif font-medium leading-none tabular-nums"
              style={{ fontSize: 52 }}
              data-testid="text-time-display"
            >
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-sm text-ink-soft font-medium" data-testid="text-round-label">
              {phaseIsWork ? `Round ${round}` : `After round ${round}`}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3.5" data-testid="controls">
          <button
            className="btn-secondary text-sm px-4 py-2.5"
            onClick={reset}
            aria-label="Reset timer"
            data-testid="button-reset"
          >
            Reset
          </button>
          <button
            className="btn-primary px-8 py-3.5 text-base"
            onClick={running ? pause : start}
            style={running ? { backgroundColor: "var(--color-clay)" } : {}}
            data-testid="button-start-pause"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            className="btn-secondary text-sm px-4 py-2.5"
            onClick={skip}
            aria-label="Skip to next"
            data-testid="button-skip"
          >
            Skip
          </button>
        </div>

        {/* Length picker */}
        <div
          className="w-full pt-4 border-t border-line flex flex-col items-center gap-2"
          style={{ opacity: !phaseIsWork ? 0.4 : 1, pointerEvents: !phaseIsWork ? "none" : undefined }}
          data-testid="length-picker"
        >
          <span className="text-xs text-ink-soft font-semibold tracking-widest uppercase">Focus length</span>
          <div className="flex gap-2" data-testid="length-options">
            {[5, 15, 25, 50].map((min) => (
              <button
                key={min}
                className="px-4 py-2 rounded-full text-sm font-semibold border-[1.5px] transition-all duration-200"
                style={focusMinutes === min
                  ? { background: "var(--color-ink)", borderColor: "var(--color-ink)", color: "var(--color-paper-raised)" }
                  : { background: "var(--color-paper)", borderColor: "var(--color-line)", color: "var(--color-ink-soft)" }
                }
                onClick={() => applyLength(min)}
                data-testid={`button-length-${min}`}
              >
                {min}m
              </button>
            ))}
          </div>
        </div>

        {/* Streak */}
        <p className="text-sm text-ink-soft" data-testid="text-streak">
          {streak === 1 ? "1 session completed today" : `${streak} sessions completed today`}
        </p>
      </div>

      {/* Toast stack — anchored to bottom, grows upward */}
      {(showStudyToast || showWaterToast) && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
            fontFamily: "Verdana, Geneva, sans-serif",
          }}
        >
          {/* Water reminder — above study toast */}
          {showWaterToast && (
            <div
              style={{
                background: "hsl(var(--paper-raised))",
                border: "1.5px solid hsl(var(--line))",
                borderRadius: 18,
                boxShadow: "var(--shadow-warm-2)",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                minWidth: 280,
                maxWidth: 340,
                animation: "slideUp 0.25s ease-out",
              }}
              data-testid="water-toast"
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "hsl(var(--ink))", lineHeight: 1.4 }}>
                You've been focused for over an hour today — had water recently?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { logWaterGlass(); setShowWaterToast(false); }}
                  style={{
                    flex: 1,
                    padding: "9px 14px",
                    borderRadius: 999,
                    border: "none",
                    background: "hsl(var(--ink))",
                    color: "hsl(var(--paper-raised))",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "Verdana, Geneva, sans-serif",
                  }}
                  data-testid="water-toast-yes"
                >
                  Yes 💧
                </button>
                <button
                  onClick={() => setShowWaterToast(false)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 999,
                    border: "1.5px solid hsl(var(--line))",
                    background: "transparent",
                    color: "hsl(var(--ink-soft))",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Verdana, Geneva, sans-serif",
                  }}
                  data-testid="water-toast-dismiss"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Study prompt — bottom of stack */}
          {showStudyToast && (
            <div
              style={{
                background: "hsl(var(--paper-raised))",
                border: "1.5px solid hsl(var(--line))",
                borderRadius: 18,
                boxShadow: "var(--shadow-warm-2)",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                minWidth: 280,
                maxWidth: 340,
                animation: "slideUp 0.25s ease-out",
              }}
              data-testid="study-toast"
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "hsl(var(--ink))", lineHeight: 1.4 }}>
                Nice work! Want to log a study session?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setShowStudyToast(false); navigate("/study"); }}
                  style={{
                    flex: 1,
                    padding: "9px 14px",
                    borderRadius: 999,
                    border: "none",
                    background: "hsl(var(--ink))",
                    color: "hsl(var(--paper-raised))",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "Verdana, Geneva, sans-serif",
                  }}
                  data-testid="toast-yes"
                >
                  Yes, open Study
                </button>
                <button
                  onClick={() => setShowStudyToast(false)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 999,
                    border: "1.5px solid hsl(var(--line))",
                    background: "transparent",
                    color: "hsl(var(--ink-soft))",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Verdana, Geneva, sans-serif",
                  }}
                  data-testid="toast-dismiss"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
}
