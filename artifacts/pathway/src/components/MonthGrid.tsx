import { useState } from "react";
import { getMonthGrid } from "../lib/monthUtils";
import DayDetailModal from "./DayDetailModal";
import type { PlanItem } from "../pages/Plan";

const FF = "Verdana, Geneva, sans-serif";
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthGridProps {
  year: number;
  month: number;
  items: PlanItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (date: string, text: string, time?: string) => void;
  onUpdateText: (id: string, text: string) => void;
}

export default function MonthGrid({ year, month, items, onToggle, onDelete, onAdd, onUpdateText }: MonthGridProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const days = getMonthGrid(year, month);

  const counts: Record<string, number> = {};
  for (const i of items) counts[i.date] = (counts[i.date] || 0) + 1;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "hsl(var(--ink-soft))", padding: "4px 0", fontFamily: FF }}>
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map((day) => {
          const count = counts[day.dateKey] || 0;
          return (
            <button
              key={day.dateKey}
              onClick={() => setSelectedDate(day.dateKey)}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 10,
                border: day.isToday ? "1.5px solid hsl(var(--clay))" : "1.5px solid hsl(var(--line))",
                background: day.isCurrentMonth ? "hsl(var(--paper))" : "transparent",
                opacity: day.isCurrentMonth ? 1 : 0.35,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingTop: 6,
                cursor: "pointer",
                fontFamily: FF,
                transition: "border-color 0.15s ease",
              }}
            >
              <span style={{ fontSize: 12, color: day.isCurrentMonth ? "hsl(var(--ink))" : "hsl(var(--ink-soft))" }}>
                {day.dayOfMonth}
              </span>
              {count > 0 && (
                <span
                  style={{
                    marginTop: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: "hsl(var(--clay-soft))",
                    color: "hsl(var(--clay))",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <DayDetailModal
          dateKey={selectedDate}
          items={items}
          onClose={() => setSelectedDate(null)}
          onToggle={onToggle}
          onDelete={onDelete}
          onAdd={onAdd}
          onUpdateText={onUpdateText}
        />
      )}
    </div>
  );
}
