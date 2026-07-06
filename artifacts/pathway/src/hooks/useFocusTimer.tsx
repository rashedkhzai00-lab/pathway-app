import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type FocusPhase = "work" | "break";

const STORAGE_KEY = "pathway:focusTimer";
const STREAK_KEY = "pathway:focusStreak";
const FOCUS_TIME_KEY = "pathway:focusDailyMinutes";
const BREAK_MAP: Record<number, number> = { 5: 1, 15: 5, 25: 5, 50: 10 };
const DEFAULT_LEN = 25;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function getStreakCount(): number {
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

function addFocusMinutes(min: number): number {
  let raw: Record<string, number> = {};
  try {
    raw = JSON.parse(localStorage.getItem(FOCUS_TIME_KEY) || "{}");
  } catch {}
  const key = todayKey();
  raw[key] = (raw[key] || 0) + min;
  localStorage.setItem(FOCUS_TIME_KEY, JSON.stringify(raw));
  return raw[key];
}

function playChime() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
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

interface FocusTimerState {
  running: boolean;
  phase: FocusPhase;
  round: number;
  focusMinutes: number;
  totalSeconds: number;
  endTimestamp: number | null;
  remainingSecondsWhenPaused: number | null;
}

export interface FocusCompletionEvent {
  phase: FocusPhase;
  at: number;
  checkWater: boolean;
}

interface FocusTimerContextValue {
  running: boolean;
  phase: FocusPhase;
  round: number;
  focusMinutes: number;
  totalSeconds: number;
  remainingSeconds: number;
  streak: number;
  lastCompletion: FocusCompletionEvent | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  applyLength: (min: number) => void;
}

function defaultState(): FocusTimerState {
  return {
    running: false,
    phase: "work",
    round: 1,
    focusMinutes: DEFAULT_LEN,
    totalSeconds: DEFAULT_LEN * 60,
    endTimestamp: null,
    remainingSecondsWhenPaused: DEFAULT_LEN * 60,
  };
}

function loadState(): FocusTimerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

const FocusTimerContext = createContext<FocusTimerContextValue | null>(null);

export function FocusTimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FocusTimerState>(loadState);
  const [, forceTick] = useState(0);
  const [streak, setStreak] = useState(getStreakCount);
  const [lastCompletion, setLastCompletion] = useState<FocusCompletionEvent | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // re-render every quarter second so the on-screen countdown stays live;
  // the actual remaining time is always derived from endTimestamp, so
  // throttling in a background tab causes zero drift.
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!state.running || state.endTimestamp === null) return;
    const remaining = state.endTimestamp - Date.now();
    if (remaining > 0) return;

    playChime();
    const completedPhase = state.phase;

    setState((s) => {
      if (completedPhase === "work") {
        const newDailyMin = addFocusMinutes(s.focusMinutes);
        setStreak(incrementStreak());
        const breakSec = (BREAK_MAP[s.focusMinutes] || 5) * 60;
        setLastCompletion({
          phase: "work",
          at: Date.now(),
          checkWater: newDailyMin >= 60,
        });
        return {
          ...s,
          running: false,
          phase: "break",
          totalSeconds: breakSec,
          endTimestamp: null,
          remainingSecondsWhenPaused: breakSec,
        };
      } else {
        const workSec = s.focusMinutes * 60;
        setLastCompletion({ phase: "break", at: Date.now(), checkWater: false });
        return {
          ...s,
          running: false,
          phase: "work",
          round: s.round + 1,
          totalSeconds: workSec,
          endTimestamp: null,
          remainingSecondsWhenPaused: workSec,
        };
      }
    });
  }, [state.running, state.endTimestamp, state.phase]);

  const start = useCallback(() => {
    setState((s) => {
      if (s.running) return s;
      const remaining = s.remainingSecondsWhenPaused ?? s.totalSeconds;
      return {
        ...s,
        running: true,
        endTimestamp: Date.now() + remaining * 1000,
        remainingSecondsWhenPaused: null,
      };
    });
  }, []);

  const pause = useCallback(() => {
    setState((s) => {
      if (!s.running || s.endTimestamp === null) return s;
      return {
        ...s,
        running: false,
        remainingSecondsWhenPaused: Math.max(0, Math.round((s.endTimestamp - Date.now()) / 1000)),
        endTimestamp: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      running: false,
      endTimestamp: null,
      remainingSecondsWhenPaused: s.totalSeconds,
    }));
  }, []);

  const skip = useCallback(() => {
    setState((s) => {
      if (s.phase === "work") {
        const breakSec = (BREAK_MAP[s.focusMinutes] || 5) * 60;
        setLastCompletion({ phase: "work", at: Date.now(), checkWater: false });
        return {
          ...s,
          running: false,
          phase: "break",
          totalSeconds: breakSec,
          endTimestamp: null,
          remainingSecondsWhenPaused: breakSec,
        };
      } else {
        const workSec = s.focusMinutes * 60;
        return {
          ...s,
          running: false,
          phase: "work",
          round: s.round + 1,
          totalSeconds: workSec,
          endTimestamp: null,
          remainingSecondsWhenPaused: workSec,
        };
      }
    });
  }, []);

  const applyLength = useCallback((min: number) => {
    setState((s) => {
      if (s.running) return s;
      if (s.phase !== "work") return { ...s, focusMinutes: min };
      return {
        ...s,
        focusMinutes: min,
        totalSeconds: min * 60,
        remainingSecondsWhenPaused: min * 60,
      };
    });
  }, []);

  const remainingSeconds = state.running
    ? Math.max(0, Math.round(((state.endTimestamp ?? Date.now()) - Date.now()) / 1000))
    : state.remainingSecondsWhenPaused ?? state.totalSeconds;

  const value: FocusTimerContextValue = {
    running: state.running,
    phase: state.phase,
    round: state.round,
    focusMinutes: state.focusMinutes,
    totalSeconds: state.totalSeconds,
    remainingSeconds,
    streak,
    lastCompletion,
    start,
    pause,
    reset,
    skip,
    applyLength,
  };

  return <FocusTimerContext.Provider value={value}>{children}</FocusTimerContext.Provider>;
}

export function useFocusTimer() {
  const ctx = useContext(FocusTimerContext);
  if (!ctx) {
    throw new Error("useFocusTimer must be used within a FocusTimerProvider");
  }
  return ctx;
}
