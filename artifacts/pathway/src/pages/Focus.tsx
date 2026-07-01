import { useState, useRef, useEffect, useCallback } from "react";
import { useSearch, useLocation } from "wouter";

const CIRCUMFERENCE = 2 * Math.PI * 108;
const BREAK_MAP: Record<number, number> = { 15: 5, 25: 5, 50: 10 };
const STREAK_KEY = "pathway:focusStreak";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getStreakCount(): number {
  try {
    const raw = JSON.parse(localStorage.getItem(STREAK_KEY) || "{}");
    return raw[todayKey()] || 0;
  } catch {
    return 0;
  }
}

function incrementStreak(): number {
  let raw: Record<string, number> = {};
  try {
    raw = JSON.parse(localStorage.getItem(STREAK_KEY) || "{}");
  } catch {}
  const key = todayKey();
  raw[key] = (raw[key] || 0) + 1;
  localStorage.setItem(STREAK_KEY, JSON.stringify(raw));
  return raw[key];
}

function formatTime(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60).toString().padStart(2, "0");
  const s = Math.floor(Math.max(0, sec) % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.55);
    });
  } catch {}
}

export default function Focus() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const rawLen = parseInt(params.get("len") || "25", 10);
  const defaultLen = [15, 25, 50].includes(rawLen) ? rawLen : 25;

  const [focusMinutes, setFocusMinutes] = useState(defaultLen);
  const [phase, setPhase] = useState<"work" | "break">("work");
  const [round, setRound] = useState(1);
  const [totalSeconds, setTotalSeconds] = useState(defaultLen * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(defaultLen * 60);
  const [running, setRunning] = useState(false);
  const [streak, setStreak] = useState(getStreakCount);
  const [showStudyToast, setShowStudyToast] = useState(false);
  const [, navigate] = useLocation();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimestampRef = useRef<number>(0);

  const phaseIsWork = phase === "work";
  const ringOffset = CIRCUMFERENCE * (1 - remainingSeconds / Math.max(totalSeconds, 1));

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const renderTime = useCallback(() => formatTime(remainingSeconds), [remainingSeconds]);

  useEffect(() => {
    const label = running
      ? `${formatTime(remainingSeconds)} · ${phase === "work" ? "Focusing" : "Break"} — ADHDrive`
      : "Focus — ADHDrive";
    document.title = label;
  }, [running, remainingSeconds, phase]);

  const completePhase = useCallback((currentPhase: "work" | "break", currentRound: number, currentFocusMin: number) => {
    clearTimer();
    setRunning(false);
    playChime();

    if (currentPhase === "work") {
      const newCount = incrementStreak();
      setStreak(newCount);
      const breakSec = (BREAK_MAP[currentFocusMin] || 5) * 60;
      setPhase("break");
      setTotalSeconds(breakSec);
      setRemainingSeconds(breakSec);
      setShowStudyToast(true);
    } else {
      const newRound = currentRound + 1;
      setRound(newRound);
      const workSec = currentFocusMin * 60;
      setPhase("work");
      setTotalSeconds(workSec);
      setRemainingSeconds(workSec);
    }
  }, [clearTimer]);

  const startTimer = useCallback(() => {
    if (running) return;
    setRunning(true);
    endTimestampRef.current = Date.now() + remainingSeconds * 1000;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const rem = Math.round((endTimestampRef.current - now) / 1000);
      if (rem <= 0) {
        setRemainingSeconds(0);
        setPhase(p => {
          setRound(r => {
            setFocusMinutes(fm => {
              completePhase(p, r, fm);
              return fm;
            });
            return r;
          });
          return p;
        });
      } else {
        setRemainingSeconds(rem);
      }
    }, 250);
  }, [running, remainingSeconds, completePhase]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setRunning(false);
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setRunning(false);
    setRemainingSeconds(totalSeconds);
  }, [clearTimer, totalSeconds]);

  const skipPhase = useCallback(() => {
    clearTimer();
    setRunning(false);
    setPhase(p => {
      setRound(r => {
        setFocusMinutes(fm => {
          if (p === "work") {
            const breakSec = (BREAK_MAP[fm] || 5) * 60;
            setPhase("break");
            setTotalSeconds(breakSec);
            setRemainingSeconds(breakSec);
          } else {
            const newRound = r + 1;
            setRound(newRound);
            const workSec = fm * 60;
            setPhase("work");
            setTotalSeconds(workSec);
            setRemainingSeconds(workSec);
          }
          return fm;
        });
        return r;
      });
      return p;
    });
  }, [clearTimer]);

  const applyLength = useCallback((min: number) => {
    if (running) return;
    setFocusMinutes(min);
    if (phase === "work") {
      setTotalSeconds(min * 60);
      setRemainingSeconds(min * 60);
    }
  }, [running, phase]);

  useEffect(() => {
    return () => { clearTimer(); document.title = "ADHDrive"; };
  }, [clearTimer]);

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
              {renderTime()}
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
            onClick={resetTimer}
            aria-label="Reset timer"
            data-testid="button-reset"
          >
            Reset
          </button>
          <button
            className="btn-primary px-8 py-3.5 text-base"
            onClick={running ? pauseTimer : startTimer}
            style={running ? { backgroundColor: "var(--color-clay)" } : {}}
            data-testid="button-start-pause"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            className="btn-secondary text-sm px-4 py-2.5"
            onClick={skipPhase}
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
            {[15, 25, 50].map((min) => (
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

      {/* Study prompt toast */}
      {showStudyToast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
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
            fontFamily: "Verdana, Geneva, sans-serif",
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
  );
}
