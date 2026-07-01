import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import Footer from "../components/Footer";

// ─── Storage keys & types ────────────────────────────────────────────────────

const BANK_KEY = "pathway:questionBank";
const WEAK_KEY = "pathway:weakSpots";
const SESSION_KEY = "pathway:activeSession";

interface Question {
  id: string;
  category: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

interface Session {
  mode: "quick" | "exam" | "weak" | "category";
  questionIds: string[];
  currentIndex: number;
  correctCount: number;
  missedIds: string[];
  answers: Record<string, number>;
  startTime: number;
  timeLimitSeconds: number | null;
  categoryName: string | null;
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

function loadBank(): Question[] {
  try { return JSON.parse(localStorage.getItem(BANK_KEY) || "[]"); } catch { return []; }
}
function loadWeak(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(WEAK_KEY) || "{}"); } catch { return {}; }
}
function saveWeak(w: Record<string, number>) {
  localStorage.setItem(WEAK_KEY, JSON.stringify(w));
}
function loadSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}
function saveSession(s: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatClock(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Shared style constants ───────────────────────────────────────────────────

const card: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: 560,
  background: "hsl(var(--paper-raised))",
  border: "1px solid hsl(var(--line))",
  borderRadius: "var(--radius)",
  boxShadow: "var(--shadow-warm-1), var(--shadow-warm-2)",
  padding: "40px 40px 32px",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "hsl(var(--clay))",
};

const h2Style: React.CSSProperties = {
  margin: 0,
  fontWeight: 500,
  color: "hsl(var(--ink))",
  fontStyle: "normal",
};

// ─── Views ────────────────────────────────────────────────────────────────────

type View = "home" | "category" | "session" | "results";

interface ResultsData {
  total: number;
  correct: number;
  missedIds: string[];
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Study() {
  const [view, setView] = useState<View>("home");
  const [results, setResults] = useState<ResultsData | null>(null);
  const [, forceRender] = useState(0);

  function refresh() { forceRender(n => n + 1); }

  function startSession(
    questionIds: string[],
    mode: Session["mode"],
    opts: { timeLimitSeconds?: number; categoryName?: string } = {}
  ) {
    const session: Session = {
      mode,
      questionIds,
      currentIndex: 0,
      correctCount: 0,
      missedIds: [],
      answers: {},
      startTime: Date.now(),
      timeLimitSeconds: opts.timeLimitSeconds ?? null,
      categoryName: opts.categoryName ?? null,
    };
    saveSession(session);
    setView("session");
  }

  function handleSessionEnd(data: ResultsData) {
    setResults(data);
    setView("results");
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        background: "hsl(var(--paper))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 70,
        paddingBottom: 60,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <button
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 text-ink-soft hover:text-ink text-sm font-medium flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-paper-raised"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        ← Back
      </button>

      {view === "home" && (
        <HomeView
          onStart={startSession}
          onCategory={() => setView("category")}
          onResume={() => setView("session")}
          refreshKey={forceRender}
        />
      )}
      {view === "category" && (
        <CategoryView
          onBack={() => setView("home")}
          onStart={startSession}
        />
      )}
      {view === "session" && (
        <SessionView
          onExit={() => { refresh(); setView("home"); }}
          onFinish={handleSessionEnd}
        />
      )}
      {view === "results" && results && (
        <ResultsView
          data={results}
          onHome={() => { refresh(); setView("home"); }}
          onDrillMissed={(ids) => {
            startSession(shuffle(ids), "weak");
          }}
        />
      )}
      <Footer />
    </div>
  );
}

// ─── Home View ────────────────────────────────────────────────────────────────

function HomeView({
  onStart,
  onCategory,
  onResume,
}: {
  onStart: (ids: string[], mode: Session["mode"], opts?: { timeLimitSeconds?: number; categoryName?: string }) => void;
  onCategory: () => void;
  onResume: () => void;
  refreshKey: React.Dispatch<React.SetStateAction<number>>;
}) {
  const bank = loadBank();
  const weak = loadWeak();
  const weakIds = Object.keys(weak).filter((id) => weak[id] > 0);
  const cats = new Set(bank.map((q) => q.category));
  const session = loadSession();
  const hasResume = !!session && session.currentIndex < session.questionIds.length;
  const resumeRemaining = hasResume
    ? session!.questionIds.length - session!.currentIndex
    : 0;
  const hasBank = bank.length > 0;

  return (
    <div style={card}>
      <div>
        <p style={eyebrow}>Study</p>
        <h2 style={{ ...h2Style, fontSize: "1.75rem", marginTop: 6 }}>
          Driving theory practice
        </h2>
      </div>

      {hasBank && (
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { num: bank.length, label: "questions" },
            { num: weakIds.length, label: "weak spots" },
            { num: cats.size, label: "categories" },
          ].map(({ num, label }) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: "hsl(var(--paper))",
                border: "1.5px solid hsl(var(--line))",
                borderRadius: 14,
                padding: "14px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span
                style={{
                  fontFamily: "Verdana, Geneva, sans-serif",
                  fontWeight: 500,
                  fontSize: 26,
                  color: "hsl(var(--ink))",
                }}
              >
                {num}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  color: "hsl(var(--ink-soft))",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {hasResume && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "#EEF2EC",
            border: "1.5px solid hsl(var(--sage))",
            borderRadius: 14,
            padding: "14px 16px",
            fontSize: 14,
            color: "hsl(var(--ink))",
          }}
        >
          <span>
            {resumeRemaining} question{resumeRemaining === 1 ? "" : "s"} left in your last session.
          </span>
          <button
            onClick={onResume}
            style={{
              background: "hsl(var(--sage))",
              color: "hsl(var(--paper-raised))",
              border: "none",
              borderRadius: 999,
              padding: "9px 18px",
              fontFamily: "Verdana, Geneva, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Resume
          </button>
        </div>
      )}

      {hasBank ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ActionCard
            title="Drill my weak spots"
            sub={
              weakIds.length
                ? `${weakIds.length} question${weakIds.length === 1 ? "" : "s"} you've missed before`
                : "No weak spots yet — nice"
            }
            highlight
            disabled={weakIds.length === 0}
            onClick={() => onStart(shuffle(weakIds), "weak")}
          />
          <ActionCard
            title="Quick practice"
            sub="12 random questions, no timer"
            onClick={() => {
              const ids = shuffle(bank.map((q) => q.id)).slice(0, 12);
              onStart(ids, "quick");
            }}
          />
          <ActionCard
            title="Practice by category"
            sub="Pick a topic to focus on"
            onClick={onCategory}
          />
          <ActionCard
            title="Timed mock exam"
            sub="20 questions, simulates the real test"
            onClick={() => {
              const ids = shuffle(bank.map((q) => q.id)).slice(0, Math.min(20, bank.length));
              onStart(ids, "exam", { timeLimitSeconds: 20 * 60 });
            }}
          />
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0 4px",
            color: "hsl(var(--ink-soft))",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <p style={{ margin: "2px 0" }}>Your question bank is empty.</p>
          <p style={{ margin: "2px 0", fontSize: 13.5, maxWidth: 340 }}>
            Add or fix questions in the Create module first, then come back here to practice.
          </p>
          <Link
            href="/create"
            style={{
              marginTop: 10,
              background: "hsl(var(--ink))",
              color: "hsl(var(--paper-raised))",
              borderRadius: 999,
              padding: "11px 22px",
              fontFamily: "Verdana, Geneva, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Go to Create
          </Link>
        </div>
      )}
    </div>
  );
}

function ActionCard({
  title,
  sub,
  highlight = false,
  disabled = false,
  onClick,
}: {
  title: string;
  sub: string;
  highlight?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const active = !disabled && (hov || highlight);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: "left",
        background: active ? "#FBF3EE" : "hsl(var(--paper))",
        border: `1.5px solid ${active ? "hsl(var(--clay))" : "hsl(var(--line))"}`,
        borderRadius: 14,
        padding: "16px 18px",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        transition: "border-color 0.18s ease, background 0.18s ease",
        opacity: disabled ? 0.5 : 1,
        width: "100%",
      }}
    >
      <span
        style={{
          fontFamily: "Verdana, Geneva, sans-serif",
          fontWeight: 600,
          fontSize: 15.5,
          color: highlight ? "#A8502C" : "hsl(var(--ink))",
        }}
      >
        {title}
      </span>
      <span style={{ fontSize: 13, color: "hsl(var(--ink-soft))" }}>{sub}</span>
    </button>
  );
}

// ─── Category View ────────────────────────────────────────────────────────────

function CategoryView({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: (ids: string[], mode: Session["mode"], opts?: { categoryName?: string }) => void;
}) {
  const bank = loadBank();
  const counts: Record<string, number> = {};
  bank.forEach((q) => { counts[q.category] = (counts[q.category] || 0) + 1; });
  const cats = Object.keys(counts).sort();

  return (
    <div style={card}>
      <button
        onClick={onBack}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "hsl(var(--ink-soft))",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          padding: "4px 0",
          fontFamily: "Verdana, Geneva, sans-serif",
        }}
      >
        ← Back
      </button>
      <h2 style={{ ...h2Style, fontSize: "1.75rem" }}>Pick a category</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {cats.map((cat) => (
          <CategoryItem
            key={cat}
            name={cat}
            count={counts[cat]}
            onClick={() => {
              const ids = shuffle(bank.filter((q) => q.category === cat).map((q) => q.id)).slice(0, 15);
              onStart(ids, "category", { categoryName: cat });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryItem({
  name,
  count,
  onClick,
}: {
  name: string;
  count: number;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: hov ? "#FBF3EE" : "hsl(var(--paper))",
        border: `1.5px solid ${hov ? "hsl(var(--clay))" : "hsl(var(--line))"}`,
        borderRadius: 14,
        padding: "14px 18px",
        cursor: "pointer",
        fontFamily: "Verdana, Geneva, sans-serif",
        fontSize: 15,
        fontWeight: 500,
        color: "hsl(var(--ink))",
        transition: "border-color 0.18s ease, background 0.18s ease",
        width: "100%",
        textAlign: "left",
      }}
    >
      <span>{name}</span>
      <span style={{ fontSize: 13, color: "hsl(var(--ink-soft))", fontWeight: 600 }}>
        {count}
      </span>
    </button>
  );
}

// ─── Session View ─────────────────────────────────────────────────────────────

type AnswerState = { chosen: number } | null;

function SessionView({
  onExit,
  onFinish,
}: {
  onExit: () => void;
  onFinish: (data: ResultsData) => void;
}) {
  const [answerState, setAnswerState] = useState<AnswerState>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [, tick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const session = loadSession();

  const startTimer = useCallback((sess: Session) => {
    if (!sess.timeLimitSeconds) return;
    if (timerRef.current) clearInterval(timerRef.current);

    function computeRemaining() {
      const elapsed = Math.floor((Date.now() - sess.startTime) / 1000);
      return Math.max(0, sess.timeLimitSeconds! - elapsed);
    }

    setTimeLeft(computeRemaining());

    timerRef.current = setInterval(() => {
      const rem = computeRemaining();
      setTimeLeft(rem);
      if (rem <= 0) {
        clearInterval(timerRef.current!);
        finishSession();
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sess = loadSession();
    if (sess?.timeLimitSeconds) startTimer(sess);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  // Re-read session after each question advance
  useEffect(() => {
    setAnswerState(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.currentIndex]);

  function finishSession() {
    if (timerRef.current) clearInterval(timerRef.current);
    const sess = loadSession();
    if (!sess) return;
    const data: ResultsData = {
      total: sess.questionIds.length,
      correct: sess.correctCount,
      missedIds: sess.missedIds.slice(),
    };
    clearSession();
    onFinish(data);
  }

  if (!session) {
    onExit();
    return null;
  }

  const bank = loadBank();
  const bankMap = Object.fromEntries(bank.map((q) => [q.id, q]));

  // Skip deleted questions
  let currentSession = session;
  while (
    currentSession.currentIndex < currentSession.questionIds.length &&
    !bankMap[currentSession.questionIds[currentSession.currentIndex]]
  ) {
    currentSession = { ...currentSession, currentIndex: currentSession.currentIndex + 1 };
    saveSession(currentSession);
  }

  if (currentSession.currentIndex >= currentSession.questionIds.length) {
    finishSession();
    return null;
  }

  const total = currentSession.questionIds.length;
  const idx = currentSession.currentIndex;
  const q = bankMap[currentSession.questionIds[idx]];
  const pct = Math.round((idx / total) * 100);
  const LETTERS = ["A", "B", "C", "D"] as const;

  function handleAnswer(chosenIdx: number) {
    if (answerState) return;
    const sess = loadSession();
    if (!sess) return;

    const isCorrect = chosenIdx === q.correctIndex;
    const weak = loadWeak();
    if (isCorrect) {
      if (weak[q.id]) {
        weak[q.id] = Math.max(0, weak[q.id] - 1);
        if (weak[q.id] === 0) delete weak[q.id];
      }
      sess.correctCount += 1;
    } else {
      weak[q.id] = (weak[q.id] || 0) + 1;
      sess.missedIds.push(q.id);
    }
    saveWeak(weak);
    sess.answers[q.id] = chosenIdx;
    saveSession(sess);
    setAnswerState({ chosen: chosenIdx });
  }

  function handleNext() {
    const sess = loadSession();
    if (!sess) return;
    sess.currentIndex += 1;
    saveSession(sess);
    if (sess.currentIndex >= sess.questionIds.length) {
      finishSession();
    } else {
      tick((n) => n + 1);
      setAnswerState(null);
    }
  }

  const answered = answerState !== null;

  return (
    <div style={card}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => { if (timerRef.current) clearInterval(timerRef.current); onExit(); }}
          style={{
            background: "none",
            border: "none",
            color: "hsl(var(--ink-soft))",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            padding: "4px 0",
            fontFamily: "Verdana, Geneva, sans-serif",
          }}
        >
          ← Exit
        </button>
        {currentSession.timeLimitSeconds && timeLeft !== null && (
          <span
            style={{
              fontFamily: "Verdana, Geneva, sans-serif",
              fontWeight: 500,
              fontSize: 18,
              color: timeLeft < 60 ? "hsl(var(--clay))" : "hsl(var(--ink-soft))",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatClock(timeLeft)}
          </span>
        )}
      </div>

      {/* Progress */}
      <div>
        <div
          style={{
            width: "100%",
            height: 6,
            background: "hsl(var(--line))",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "hsl(var(--clay))",
              borderRadius: 999,
              width: `${pct}%`,
              transition: "width 0.35s ease",
            }}
          />
        </div>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 12.5,
            color: "hsl(var(--ink-soft))",
            fontWeight: 600,
          }}
        >
          Question {idx + 1} of {total}
        </p>
      </div>

      {/* Question */}
      <div>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "hsl(var(--clay))",
          }}
        >
          {q.category}
        </p>
        <h2
          style={{
            ...h2Style,
            fontSize: "clamp(19px, 3.4vw, 23px)",
            lineHeight: 1.35,
          }}
        >
          {q.text}
        </h2>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          const isChosen = answered && answerState!.chosen === i;
          const isCorrect = i === q.correctIndex;
          const showCorrect = answered && isCorrect;
          const showWrong = answered && isChosen && !isCorrect;

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              style={{
                textAlign: "left",
                background: showCorrect
                  ? "#EEF2EC"
                  : showWrong
                  ? "#FBF0EB"
                  : "hsl(var(--paper))",
                border: `1.5px solid ${
                  showCorrect
                    ? "hsl(var(--sage))"
                    : showWrong
                    ? "hsl(var(--clay))"
                    : "hsl(var(--line))"
                }`,
                borderRadius: 14,
                padding: "15px 18px",
                fontFamily: "Verdana, Geneva, sans-serif",
                fontSize: 15,
                color: "hsl(var(--ink))",
                cursor: answered ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "border-color 0.15s ease, background 0.15s ease",
                width: "100%",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: `1.5px solid ${
                    showCorrect
                      ? "hsl(var(--sage))"
                      : showWrong
                      ? "hsl(var(--clay))"
                      : "hsl(var(--line))"
                  }`,
                  background: showCorrect
                    ? "hsl(var(--sage))"
                    : showWrong
                    ? "hsl(var(--clay))"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color:
                    showCorrect || showWrong
                      ? "hsl(var(--paper-raised))"
                      : "hsl(var(--ink-soft))",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                {LETTERS[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && q.explanation && (
        <div
          style={{
            background: "hsl(var(--paper))",
            borderLeft: "3px solid hsl(var(--dusty-blue))",
            borderRadius: "0 12px 12px 0",
            padding: "14px 16px",
            fontSize: 14,
            color: "hsl(var(--ink-soft))",
            lineHeight: 1.5,
          }}
        >
          {q.explanation}
        </div>
      )}

      {/* Next */}
      {answered && (
        <button
          onClick={handleNext}
          autoFocus
          style={{
            background: "hsl(var(--ink))",
            color: "hsl(var(--paper-raised))",
            border: "none",
            borderRadius: 999,
            padding: "13px 22px",
            fontFamily: "Verdana, Geneva, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            textAlign: "center",
            width: "100%",
          }}
        >
          {idx + 1 >= total ? "See results" : "Next question"}
        </button>
      )}
    </div>
  );
}

// ─── Results View ─────────────────────────────────────────────────────────────

function ResultsView({
  data,
  onHome,
  onDrillMissed,
}: {
  data: ResultsData;
  onHome: () => void;
  onDrillMissed: (ids: string[]) => void;
}) {
  const { total, correct, missedIds } = data;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const headline =
    pct >= 80 ? "Strong session." : pct >= 50 ? "Good progress." : "Practice makes this easier.";

  return (
    <div style={card}>
      <p style={eyebrow}>Session complete</p>
      <h2 style={{ ...h2Style, fontSize: "1.75rem" }}>{headline}</h2>

      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span
          style={{
            fontFamily: "Verdana, Geneva, sans-serif",
            fontWeight: 500,
            fontSize: 44,
            color: "hsl(var(--ink))",
          }}
        >
          {correct}/{total}
        </span>
        <span style={{ fontSize: 18, color: "hsl(var(--ink-soft))", fontWeight: 600 }}>
          {pct}%
        </span>
      </div>

      <p style={{ color: "hsl(var(--ink-soft))", fontSize: 14.5, lineHeight: 1.5, margin: 0 }}>
        {missedIds.length
          ? `${missedIds.length} question${missedIds.length === 1 ? "" : "s"} got added to your weak spots.`
          : "Nothing missed this round."}
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <GhostButton onClick={onHome}>Back to Study home</GhostButton>
        {missedIds.length > 0 && (
          <button
            onClick={() => onDrillMissed(missedIds)}
            style={{
              background: "hsl(var(--ink))",
              color: "hsl(var(--paper-raised))",
              border: "none",
              borderRadius: 999,
              padding: "11px 22px",
              fontFamily: "Verdana, Geneva, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Drill what I missed
          </button>
        )}
      </div>
    </div>
  );
}

function GhostButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none",
        border: `1.5px solid ${hov ? "hsl(var(--ink))" : "hsl(var(--line))"}`,
        borderRadius: 999,
        padding: "9px 16px",
        fontFamily: "Verdana, Geneva, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: hov ? "hsl(var(--ink))" : "hsl(var(--ink-soft))",
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      {children}
    </button>
  );
}
