import { useState } from "react";
import { formatDayHeading } from "../lib/monthUtils";
import TaskQuickAddForm from "./TaskQuickAddForm";
import type { PlanItem } from "../pages/Plan";

const FF = "Verdana, Geneva, sans-serif";

interface DayDetailModalProps {
  dateKey: string;
  items: PlanItem[];
  onClose: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (date: string, text: string, time?: string) => void;
  onUpdateText: (id: string, text: string) => void;
}

export default function DayDetailModal({
  dateKey,
  items,
  onClose,
  onToggle,
  onDelete,
  onAdd,
  onUpdateText,
}: DayDetailModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const dayItems = items
    .filter((i) => i.date === dateKey)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  function startEdit(item: PlanItem) {
    setEditingId(item.id);
    setEditingText(item.text);
  }
  function saveEdit(id: string) {
    if (editingText.trim()) onUpdateText(id, editingText);
    setEditingId(null);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(30, 26, 20, 0.5)",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "hsl(var(--paper-raised))",
          border: "1px solid hsl(var(--line))",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-warm-1), var(--shadow-warm-2)",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "hsl(var(--ink))", fontFamily: FF }}>
            {formatDayHeading(dateKey)}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "hsl(var(--ink-soft))", fontSize: 13, cursor: "pointer", fontFamily: FF }}
          >
            Close
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
          {dayItems.length === 0 && (
            <p style={{ margin: 0, fontSize: 13.5, color: "hsl(var(--ink-soft))", fontFamily: FF }}>No tasks yet.</p>
          )}
          {dayItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1.5px solid hsl(var(--line))",
                borderRadius: 10,
                padding: "8px 10px",
              }}
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => onToggle(item.id)}
                aria-label={`Mark "${item.text}" as done`}
                style={{ width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
              />
              {editingId === item.id ? (
                <input
                  autoFocus
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => saveEdit(item.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                  style={{
                    flex: 1,
                    border: "1.5px solid hsl(var(--line))",
                    borderRadius: 8,
                    padding: "5px 8px",
                    fontSize: 13.5,
                    fontFamily: FF,
                    background: "hsl(var(--paper))",
                    color: "hsl(var(--ink))",
                    outline: "none",
                  }}
                />
              ) : (
                <span
                  onClick={() => startEdit(item)}
                  style={{
                    flex: 1,
                    fontSize: 13.5,
                    cursor: "text",
                    color: item.done ? "hsl(var(--ink-soft))" : "hsl(var(--ink))",
                    textDecoration: item.done ? "line-through" : "none",
                    fontFamily: FF,
                  }}
                >
                  {item.time && <span style={{ color: "hsl(var(--ink-soft))", marginRight: 6 }}>{item.time}</span>}
                  {item.text}
                </span>
              )}
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

        <TaskQuickAddForm dateKey={dateKey} onAdd={onAdd} />
      </div>
    </div>
  );
}
