import { useState, type CSSProperties } from "react";
import { getMonthLabel } from "../lib/monthUtils";
import MonthGrid from "./MonthGrid";
import MonthList from "./MonthList";
import type { PlanItem } from "../pages/Plan";

const FF = "Verdana, Geneva, sans-serif";

type ViewMode = "grid" | "list";

interface MonthViewProps {
  items: PlanItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (date: string, text: string, time?: string) => void;
  onUpdateText: (id: string, text: string) => void;
}

const navBtnStyle: CSSProperties = {
  width: 30,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  border: "1.5px solid hsl(var(--line))",
  background: "hsl(var(--paper))",
  color: "hsl(var(--ink-soft))",
  cursor: "pointer",
  fontSize: 16,
  fontFamily: FF,
};

export default function MonthView({ items, onToggle, onDelete, onAdd, onUpdateText }: MonthViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  function goToPrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }
  function goToNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={goToPrevMonth} aria-label="Previous month" style={navBtnStyle}>
            ‹
          </button>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "hsl(var(--ink))", width: 150, textAlign: "center", fontFamily: FF }}>
            {getMonthLabel(year, month)}
          </h3>
          <button onClick={goToNextMonth} aria-label="Next month" style={navBtnStyle}>
            ›
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Month display mode"
          style={{ display: "inline-flex", background: "hsl(var(--paper))", border: "1.5px solid hsl(var(--line))", borderRadius: 999, padding: 3, gap: 2 }}
        >
          {(["grid", "list"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={viewMode === m}
              onClick={() => setViewMode(m)}
              style={{
                background: viewMode === m ? "hsl(var(--clay))" : "none",
                color: viewMode === m ? "hsl(var(--paper-raised))" : "hsl(var(--ink-soft))",
                border: "none",
                padding: "6px 14px",
                fontFamily: FF,
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 999,
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              {m === "grid" ? "Grid" : "List"}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "grid" ? (
        <MonthGrid year={year} month={month} items={items} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} onUpdateText={onUpdateText} />
      ) : (
        <MonthList year={year} month={month} items={items} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />
      )}
    </div>
  );
}
