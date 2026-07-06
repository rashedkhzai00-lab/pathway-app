import { useLocation } from "wouter";
import { useFocusTimer } from "../hooks/useFocusTimer";

function formatTime(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60).toString().padStart(2, "0");
  const s = Math.floor(Math.max(0, sec) % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function FloatingTimerBar() {
  const [location] = useLocation();
  const { running, remainingSeconds, totalSeconds, phase, start, pause } = useFocusTimer();

  const midSession = running || remainingSeconds !== totalSeconds;
  if (location === "/focus" || !midSession) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderRadius: 18,
        border: "1.5px solid hsl(var(--line))",
        background: "hsl(var(--paper-raised))",
        boxShadow: "var(--shadow-warm-2)",
        padding: "10px 14px",
        fontFamily: "Verdana, Geneva, sans-serif",
      }}
      data-testid="floating-timer-bar"
    >
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: phase === "work" ? "var(--color-clay)" : "var(--color-sage)",
          }}
        >
          {phase === "work" ? "Focus" : "Break"}
        </span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            color: "hsl(var(--ink))",
          }}
        >
          {formatTime(remainingSeconds)}
        </span>
      </div>
      <button
        onClick={running ? pause : start}
        style={{
          padding: "8px 14px",
          borderRadius: 999,
          border: "none",
          background: "hsl(var(--ink))",
          color: "hsl(var(--paper-raised))",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "Verdana, Geneva, sans-serif",
        }}
        data-testid="floating-timer-toggle"
      >
        {running ? "Pause" : "Resume"}
      </button>
    </div>
  );
}
