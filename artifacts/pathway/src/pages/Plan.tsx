import { useState, useEffect, useRef, FormEvent } from "react";
import { useSearch } from "wouter";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const TASKS_KEY    = "pathway:planItems";
const SESSIONS_KEY = "pathway:studySessions";

const FF = "Verdana, Geneva, sans-serif";

function pad(n: number) { return n.toString().padStart(2, "0"); }
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function todayStr() { return toDateStr(new Date()); }

function dayLabel(dateStr: string) {
  const today = todayStr();
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${period}`;
}

function getRangeDates(view: string) {
  const dates: string[] = [];
  const start = new Date();
  const count = view === "today" ? 1 : 7;
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(toDateStr(d));
  }
  return dates;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanItem {
  id: string;
  text: string;
  date: string;
  time: string;
  done: boolean;
}

interface StudySession {
  id: string;
  topic: string;
  durationMin: number;
  date: string;
  notes: string;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

function loadTasks(): PlanItem[] {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || "[]"); } catch { return []; }
}
function saveTasks(items: PlanItem[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(items));
}

function loadSessions(): StudySession[] {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]"); } catch { return []; }
}
function saveSessions(sessions: StudySession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// ─── Plan page ────────────────────────────────────────────────────────────────

export default function Plan() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialView  = params.get("view") === "week" ? "week" : "today";
  const initialTab   = params.get("tab")  === "sessions" ? "sessions" : "tasks";

  const [mainTab, setMainTab] = useState<"tasks" | "sessions">(initialTab);

  // ── Tasks state ──
  const [view, setView]       = useState(initialView);
  const [items, setItems]     = useState<PlanItem[]>(loadTasks);
  const [showCompleted, setShowCompleted] = useState(false);
  const [taskText, setTaskText]   = useState("");
  const [dateVal, setDateVal]     = useState(todayStr());
  const [timeVal, setTimeVal]     = useState("");
  const taskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveTasks(items); }, [items]);

  function addItem(e: FormEvent) {
    e.preventDefault();
    const text = taskText.trim();
    if (!text) return;
    setItems((prev) => [...prev, {
      id: "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      text, date: dateVal || todayStr(), time: timeVal, done: false,
    }]);
    setTaskText("");
    setTimeVal("");
    taskInputRef.current?.focus();
  }

  function toggleDone(id: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, done: !i.done } : i));
  }
  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const rangeDates = getRangeDates(view);
  const groups = rangeDates
    .map((dateStr) => {
      let dayItems = items.filter((i) => i.date === dateStr);
      if (!showCompleted) dayItems = dayItems.filter((i) => !i.done);
      dayItems = [...dayItems].sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
      return { dateStr, dayItems };
    })
    .filter((g) => g.dayItems.length > 0);

  const totalVisible = groups.reduce((sum, g) => sum + g.dayItems.length, 0);

  // ── Sessions state ──
  const [sessions, setSessions] = useState<StudySession[]>(loadSessions);
  const [sessTopic, setSessTopic]   = useState("");
  const [sessDur, setSessDur]       = useState("");
  const [sessDate, setSessDate]     = useState(todayStr());
  const [sessNotes, setSessNotes]   = useState("");

  useEffect(() => { saveSessions(sessions); }, [sessions]);

  function addSession(e: FormEvent) {
    e.preventDefault();
    const topic = sessTopic.trim();
    const dur   = parseInt(sessDur, 10);
    if (!topic || !dur || dur <= 0) return;
    setSessions((prev) => [
      {
        id: "sess-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        topic,
        durationMin: dur,
        date: sessDate || todayStr(),
        notes: sessNotes.trim(),
      },
      ...prev,
    ]);
    setSessTopic("");
    setSessDur("");
    setSessNotes("");
    setSessDate(todayStr());
  }

  function deleteSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  // Group sessions by date (most recent first)
  const sessGrouped = sessions.reduce<{ date: string; items: StudySession[] }[]>((acc, s) => {
    const existing = acc.find((g) => g.date === s.date);
    if (existing) { existing.items.push(s); }
    else { acc.push({ date: s.date, items: [s] }); }
    return acc;
  }, []).sort((a, b) => b.date.localeCompare(a.date));

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMin, 0);
  const todayMinutes = sessions
    .filter((s) => s.date === todayStr())
    .reduce((sum, s) => sum + s.durationMin, 0);

  const inputStyle: React.CSSProperties = {
    border: "1.5px solid hsl(var(--line))",
    borderRadius: 10,
    background: "hsl(var(--paper-raised))",
    fontFamily: FF,
    fontSize: 13.5,
    color: "hsl(var(--ink))",
    padding: "8px 10px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center px-4 relative"
      style={{ background: "hsl(var(--paper))", paddingTop: 90, paddingBottom: 60 }}
    >
      <button
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 text-ink-soft hover:text-ink text-sm font-medium flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-paper-raised"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        ← Back
      </button>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 560,
          background: "hsl(var(--paper-raised))",
          border: "1px solid hsl(var(--line))",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-warm-1), var(--shadow-warm-2)",
          padding: "36px 36px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(var(--clay))", margin: 0 }}>
            Plan
          </p>

          {/* Main tab: Tasks | Sessions */}
          <div
            role="tablist"
            style={{
              display: "inline-flex",
              background: "hsl(var(--paper))",
              border: "1.5px solid hsl(var(--line))",
              borderRadius: 999,
              padding: 4,
              gap: 2,
              width: "fit-content",
            }}
          >
            {(["tasks", "sessions"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={mainTab === t}
                onClick={() => setMainTab(t)}
                style={{
                  background: mainTab === t ? "hsl(var(--ink))" : "none",
                  color: mainTab === t ? "hsl(var(--paper-raised))" : "hsl(var(--ink-soft))",
                  border: "none",
                  padding: "8px 20px",
                  fontFamily: FF,
                  fontSize: 13.5,
                  fontWeight: 600,
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {t === "tasks" ? "Tasks" : "Study sessions"}
              </button>
            ))}
          </div>
        </div>

        {/* ── TASKS TAB ── */}
        {mainTab === "tasks" && (
          <>
            <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "hsl(var(--ink))" }}>
              {view === "today" ? "Today" : "This week"}
            </h2>

            {/* View toggle */}
            <div
              role="tablist"
              aria-label="View range"
              style={{
                display: "inline-flex",
                background: "hsl(var(--paper))",
                border: "1.5px solid hsl(var(--line))",
                borderRadius: 999,
                padding: 4,
                width: "fit-content",
                gap: 2,
              }}
            >
              {(["today", "week"] as const).map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  style={{
                    background: view === v ? "hsl(var(--clay))" : "none",
                    color: view === v ? "hsl(var(--paper-raised))" : "hsl(var(--ink-soft))",
                    border: "none",
                    padding: "7px 16px",
                    fontFamily: FF,
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 999,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  {v === "today" ? "Today" : "This week"}
                </button>
              ))}
            </div>

            {/* Add task form */}
            <form
              onSubmit={addItem}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
                background: "hsl(var(--paper))",
                border: "1.5px solid hsl(var(--line))",
                borderRadius: 14,
                padding: 10,
              }}
            >
              <input
                ref={taskInputRef}
                type="text"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Add something…"
                autoComplete="off"
                required
                style={{
                  flex: "1 1 160px",
                  minWidth: 120,
                  border: "none",
                  background: "none",
                  fontFamily: FF,
                  fontSize: 15,
                  padding: "8px 6px",
                  color: "hsl(var(--ink))",
                  outline: "none",
                }}
              />
              <input
                type="date"
                value={dateVal}
                min={todayStr()}
                onChange={(e) => setDateVal(e.target.value)}
                aria-label="Date"
                style={{ border: "1.5px solid hsl(var(--line))", borderRadius: 10, background: "hsl(var(--paper-raised))", fontFamily: FF, fontSize: 13, color: "hsl(var(--ink-soft))", padding: "7px 8px" }}
              />
              <input
                type="time"
                value={timeVal}
                onChange={(e) => setTimeVal(e.target.value)}
                aria-label="Time (optional)"
                style={{ border: "1.5px solid hsl(var(--line))", borderRadius: 10, background: "hsl(var(--paper-raised))", fontFamily: FF, fontSize: 13, color: "hsl(var(--ink-soft))", padding: "7px 8px" }}
              />
              <button
                type="submit"
                aria-label="Add item"
                style={{
                  background: "hsl(var(--clay))",
                  color: "hsl(var(--paper-raised))",
                  border: "none",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  fontSize: 20,
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.18s ease",
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#A8502C")}
                onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--clay))")}
              >
                +
              </button>
            </form>

            {/* Task list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {groups.map(({ dateStr, dayItems }) => (
                <div key={dateStr} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dateStr === todayStr() ? "hsl(var(--clay))" : "hsl(var(--ink-soft))", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                    {dayLabel(dateStr)}
                  </div>
                  {dayItems.map((item) => (
                    <ItemRow key={item.id} item={item} onToggle={toggleDone} onDelete={deleteItem} />
                  ))}
                </div>
              ))}
            </div>

            {totalVisible === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "hsl(var(--ink-soft))" }}>
                <p style={{ margin: "4px 0" }}>Nothing here yet.</p>
                <p style={{ margin: "4px 0", fontSize: 13.5 }}>Add one thing above — that's all this needs to start.</p>
              </div>
            )}

            <button
              onClick={() => setShowCompleted((s) => !s)}
              style={{ alignSelf: "center", background: "none", border: "none", color: "hsl(var(--ink-soft))", fontSize: 13, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer", padding: 6 }}
            >
              {showCompleted ? "Hide completed" : "Show completed"}
            </button>
          </>
        )}

        {/* ── SESSIONS TAB ── */}
        {mainTab === "sessions" && (
          <>
            {/* Stats strip */}
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { label: "Today", value: todayMinutes ? `${todayMinutes}m` : "—" },
                { label: "All time", value: totalMinutes ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : "—" },
                { label: "Sessions", value: String(sessions.length) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    background: "hsl(var(--paper))",
                    border: "1.5px solid hsl(var(--line))",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "hsl(var(--ink-soft))" }}>{label}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--clay))", fontFamily: FF }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Log session form */}
            <form
              onSubmit={addSession}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "hsl(var(--paper))",
                border: "1.5px solid hsl(var(--line))",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "hsl(var(--ink-soft))" }}>
                Log a session
              </p>

              <input
                type="text"
                placeholder="Topic / subject *"
                value={sessTopic}
                onChange={(e) => setSessTopic(e.target.value)}
                required
                style={inputStyle}
              />

              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    placeholder="Duration (min) *"
                    value={sessDur}
                    min={1}
                    max={600}
                    onChange={(e) => setSessDur(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <input
                  type="date"
                  value={sessDate}
                  max={todayStr()}
                  onChange={(e) => setSessDate(e.target.value)}
                  aria-label="Session date"
                  style={{ ...inputStyle, width: "auto" }}
                />
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={sessNotes}
                onChange={(e) => setSessNotes(e.target.value)}
                rows={2}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: FF,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                }}
              />

              <button
                type="submit"
                style={{
                  alignSelf: "flex-end",
                  background: "hsl(var(--clay))",
                  color: "hsl(var(--paper-raised))",
                  border: "none",
                  borderRadius: 999,
                  padding: "9px 22px",
                  fontFamily: FF,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.18s ease",
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#A8502C")}
                onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--clay))")}
              >
                Save session
              </button>
            </form>

            {/* Session list */}
            {sessGrouped.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "hsl(var(--ink-soft))" }}>
                <p style={{ margin: "4px 0" }}>No sessions logged yet.</p>
                <p style={{ margin: "4px 0", fontSize: 13.5 }}>Fill in the form above to record your first one.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {sessGrouped.map(({ date, items: dayItems }) => (
                  <div key={date} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: date === todayStr() ? "hsl(var(--clay))" : "hsl(var(--ink-soft))", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                      {dayLabel(date)}
                      <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--ink-soft))", marginLeft: 2 }}>
                        · {dayItems.reduce((s, i) => s + i.durationMin, 0)}m total
                      </span>
                    </div>
                    {dayItems.map((sess) => (
                      <SessionRow key={sess.id} session={sess} onDelete={deleteSession} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── ItemRow ──────────────────────────────────────────────────────────────────

function ItemRow({ item, onToggle, onDelete }: { item: PlanItem; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "hsl(var(--paper))",
        border: `1.5px solid ${hovered ? "#D8D1C2" : "hsl(var(--line))"}`,
        borderRadius: 12,
        padding: "12px 14px",
        transition: "opacity 0.2s ease, border-color 0.18s ease",
        opacity: item.done ? 0.5 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggle(item.id)}
        aria-label={`Mark "${item.text}" as done`}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: item.done ? "2px solid hsl(var(--sage))" : "2px solid hsl(var(--line))",
          background: item.done ? "hsl(var(--sage))" : "transparent",
          cursor: "pointer",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          transition: "border-color 0.18s ease, background 0.18s ease",
        }}
      />
      <span style={{ flex: 1, fontSize: 15, color: item.done ? "hsl(var(--ink-soft))" : "hsl(var(--ink))", textDecoration: item.done ? "line-through" : "none" }}>
        {item.text}
      </span>
      {item.time && (
        <span style={{ fontSize: 12.5, color: "hsl(var(--ink-soft))", fontWeight: 600, flexShrink: 0 }}>
          {formatTime12(item.time)}
        </span>
      )}
      <button
        onClick={() => onDelete(item.id)}
        aria-label={`Delete "${item.text}"`}
        style={{
          background: "none",
          border: "none",
          color: "hsl(var(--ink-soft))",
          fontSize: 14,
          cursor: "pointer",
          padding: "4px 6px",
          borderRadius: 6,
          flexShrink: 0,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s ease, color 0.15s ease",
        }}
        onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--clay))")}
        onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--ink-soft))")}
      >
        ✕
      </button>
    </div>
  );
}

// ─── SessionRow ───────────────────────────────────────────────────────────────

function SessionRow({ session, onDelete }: { session: StudySession; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "hsl(var(--paper))",
        border: `1.5px solid ${hovered ? "#D8D1C2" : "hsl(var(--line))"}`,
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        transition: "border-color 0.18s ease",
        cursor: session.notes ? "pointer" : "default",
      }}
      onClick={() => { if (session.notes) setExpanded((e) => !e); }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Duration badge */}
        <span
          style={{
            background: "hsl(var(--clay-soft))",
            color: "hsl(var(--clay))",
            fontFamily: "Verdana, Geneva, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 999,
            flexShrink: 0,
          }}
        >
          {session.durationMin}m
        </span>

        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: "hsl(var(--ink))" }}>
          {session.topic}
        </span>

        {session.notes && (
          <span style={{ fontSize: 12, color: "hsl(var(--ink-soft))", flexShrink: 0 }}>
            {expanded ? "▲" : "▼"}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
          aria-label={`Delete session "${session.topic}"`}
          style={{
            background: "none",
            border: "none",
            color: "hsl(var(--ink-soft))",
            fontSize: 14,
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 6,
            flexShrink: 0,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.15s ease, color 0.15s ease",
          }}
          onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--clay))")}
          onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--ink-soft))")}
        >
          ✕
        </button>
      </div>

      {expanded && session.notes && (
        <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: "hsl(var(--ink-soft))", lineHeight: 1.5, paddingLeft: 2 }}>
          {session.notes}
        </p>
      )}
    </div>
  );
}
