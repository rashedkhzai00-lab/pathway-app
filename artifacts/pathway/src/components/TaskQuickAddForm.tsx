import { useState, type FormEvent } from "react";

const FF = "Verdana, Geneva, sans-serif";

interface TaskQuickAddFormProps {
  dateKey: string;
  onAdd: (date: string, text: string, time?: string) => void;
}

export default function TaskQuickAddForm({ dateKey, onAdd }: TaskQuickAddFormProps) {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(dateKey, text.trim(), time || undefined);
    setText("");
    setTime("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a task…"
        style={{
          flex: 1,
          border: "1.5px solid hsl(var(--line))",
          borderRadius: 8,
          padding: "6px 9px",
          fontSize: 13,
          fontFamily: FF,
          background: "hsl(var(--paper))",
          color: "hsl(var(--ink))",
          outline: "none",
        }}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        aria-label="Time (optional)"
        style={{
          border: "1.5px solid hsl(var(--line))",
          borderRadius: 8,
          padding: "6px 7px",
          fontSize: 12.5,
          fontFamily: FF,
          background: "hsl(var(--paper))",
          color: "hsl(var(--ink-soft))",
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          background: "hsl(var(--clay))",
          color: "hsl(var(--paper-raised))",
          border: "none",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 12.5,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: FF,
          flexShrink: 0,
        }}
      >
        Add
      </button>
    </form>
  );
}
