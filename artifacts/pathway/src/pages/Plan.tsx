import { useState, useEffect, useRef, FormEvent } from "react";
import { Link, useSearch } from "wouter";
import { ArrowLeft } from "lucide-react";

const STORAGE_KEY = "pathway:planItems";

interface PlanItem {
  id: string;
  text: string;
  date: string;
  time: string;
  done: boolean;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayStr() {
  return toDateStr(new Date());
}

function loadItems(): PlanItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveItems(items: PlanItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function dayLabel(dateStr: string) {
  const today = todayStr();
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diffDays = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(t: string) {
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

export default function Plan() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialView = params.get("view") === "week" ? "week" : "today";

  const [view, setView] = useState(initialView);
  const [items, setItems] = useState<PlanItem[]>(loadItems);
  const [showCompleted, setShowCompleted] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [dateVal, setDateVal] = useState(todayStr());
  const [timeVal, setTimeVal] = useState("");
  const taskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  function addItem(e: FormEvent) {
    e.preventDefault();
    const text = taskText.trim();
    if (!text) return;
    const newItem: PlanItem = {
      id: "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      text,
      date: dateVal || todayStr(),
      time: timeVal,
      done: false,
    };
    setItems((prev) => [...prev, newItem]);
    setTaskText("");
    setTimeVal("");
    taskInputRef.current?.focus();
  }

  function toggleDone(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center px-4"
      style={{ background: "hsl(var(--paper))", paddingTop: 90 }}
    >
      <Link
        href="/"
        className="absolute top-6 left-6 text-ink-soft hover:text-ink text-sm font-medium flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-paper-raised"
      >
        <ArrowLeft className="w-4 h-4" />
        Pathway
      </Link>

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
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "hsl(var(--clay))",
              margin: 0,
            }}
          >
            Plan
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "1.75rem",
              fontWeight: 500,
              color: "hsl(var(--ink))",
              fontStyle: "normal",
            }}
          >
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
                  background: view === v ? "hsl(var(--ink))" : "none",
                  color: view === v ? "hsl(var(--paper-raised))" : "hsl(var(--ink-soft))",
                  border: "none",
                  padding: "8px 18px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13.5,
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
        </div>

        {/* Add form */}
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
              fontFamily: "Inter, sans-serif",
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
            style={{
              border: "1.5px solid hsl(var(--line))",
              borderRadius: 10,
              background: "hsl(var(--paper-raised))",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "hsl(var(--ink-soft))",
              padding: "7px 8px",
            }}
          />
          <input
            type="time"
            value={timeVal}
            onChange={(e) => setTimeVal(e.target.value)}
            aria-label="Time (optional)"
            style={{
              border: "1.5px solid hsl(var(--line))",
              borderRadius: 10,
              background: "hsl(var(--paper-raised))",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "hsl(var(--ink-soft))",
              padding: "7px 8px",
            }}
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
              transition: "background 0.18s ease, transform 0.12s ease",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#A8502C")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--clay))")
            }
          >
            +
          </button>
        </form>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {groups.map(({ dateStr, dayItems }) => (
            <div key={dateStr} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color:
                    dateStr === todayStr()
                      ? "hsl(var(--clay))"
                      : "hsl(var(--ink-soft))",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "currentColor",
                    display: "inline-block",
                  }}
                />
                {dayLabel(dateStr)}
              </div>

              {dayItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={toggleDone}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {totalVisible === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "hsl(var(--ink-soft))" }}>
            <p style={{ margin: "4px 0" }}>Nothing here yet.</p>
            <p style={{ margin: "4px 0", fontSize: 13.5 }}>
              Add one thing above — that's all this needs to start.
            </p>
          </div>
        )}

        {/* Show/hide completed */}
        <button
          onClick={() => setShowCompleted((s) => !s)}
          style={{
            alignSelf: "center",
            background: "none",
            border: "none",
            color: "hsl(var(--ink-soft))",
            fontSize: 13,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor: "pointer",
            padding: 6,
          }}
        >
          {showCompleted ? "Hide completed" : "Show completed"}
        </button>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: PlanItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
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
      {/* Custom checkbox */}
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
          border: item.done
            ? "2px solid hsl(var(--sage))"
            : "2px solid hsl(var(--line))",
          background: item.done ? "hsl(var(--sage))" : "transparent",
          cursor: "pointer",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          transition: "border-color 0.18s ease, background 0.18s ease",
        }}
      />
      {item.done && (
        <span
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "hsl(var(--paper-raised))",
            pointerEvents: "none",
          }}
        />
      )}

      <span
        style={{
          flex: 1,
          fontSize: 15,
          color: item.done ? "hsl(var(--ink-soft))" : "hsl(var(--ink))",
          textDecoration: item.done ? "line-through" : "none",
        }}
      >
        {item.text}
      </span>

      {item.time && (
        <span
          style={{
            fontSize: 12.5,
            color: "hsl(var(--ink-soft))",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {formatTime(item.time)}
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
        onMouseOver={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--clay))")
        }
        onMouseOut={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--ink-soft))")
        }
      >
        ✕
      </button>
    </div>
  );
}
