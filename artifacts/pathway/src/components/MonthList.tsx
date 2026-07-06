import { getMonthDays, formatDayHeading } from "../lib/monthUtils";
import TaskQuickAddForm from "./TaskQuickAddForm";
import type { PlanItem } from "../pages/Plan";

const FF = "Verdana, Geneva, sans-serif";

interface MonthListProps {
  year: number;
  month: number;
  items: PlanItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (date: string, text: string, time?: string) => void;
}

export default function MonthList({ year, month, items, onToggle, onDelete, onAdd }: MonthListProps) {
  const days = getMonthDays(year, month);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>
      {days.map((day) => {
        const dayItems = items
          .filter((i) => i.date === day.dateKey)
          .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        return (
          <div
            key={day.dateKey}
            style={{
              borderRadius: 12,
              border: day.isToday ? "1.5px solid hsl(var(--clay))" : "1.5px solid hsl(var(--line))",
              background: day.isToday ? "hsl(var(--clay-soft))" : "hsl(var(--paper))",
              padding: "10px 12px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--ink))", marginBottom: 6, fontFamily: FF }}>
              {formatDayHeading(day.dateKey)}
            </div>

            {dayItems.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {dayItems.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => onToggle(item.id)}
                      aria-label={`Mark "${item.text}" as done`}
                      style={{ width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13.5,
                        color: item.done ? "hsl(var(--ink-soft))" : "hsl(var(--ink))",
                        textDecoration: item.done ? "line-through" : "none",
                        fontFamily: FF,
                      }}
                    >
                      {item.time && <span style={{ color: "hsl(var(--ink-soft))", marginRight: 6 }}>{item.time}</span>}
                      {item.text}
                    </span>
                    <button
                      onClick={() => onDelete(item.id)}
                      aria-label={`Delete "${item.text}"`}
                      style={{ background: "none", border: "none", color: "hsl(var(--ink-soft))", fontSize: 12, cursor: "pointer", flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <TaskQuickAddForm dateKey={day.dateKey} onAdd={onAdd} />
          </div>
        );
      })}
    </div>
  );
}
