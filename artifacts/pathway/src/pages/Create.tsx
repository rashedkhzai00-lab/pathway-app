import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { useSearch } from "wouter";
import Footer from "../components/Footer";
import {
  loadBank,
  saveBank,
  loadQuizzes,
  createQuiz,
  deleteQuiz,
  UNCATEGORIZED_QUIZ_ID,
  type Question,
  type Quiz,
} from "../lib/questionBank";

const LETTERS = ["A", "B", "C", "D"] as const;

// ─── shared style helpers ────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  border: "1.5px solid hsl(var(--line))",
  borderRadius: 12,
  padding: "11px 14px",
  fontFamily: "Verdana, Geneva, sans-serif",
  fontSize: 14.5,
  color: "hsl(var(--ink))",
  background: "hsl(var(--paper))",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: "hsl(var(--ink-soft))",
  letterSpacing: "0.02em",
};

const ghostBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1.5px solid hsl(var(--line))",
  borderRadius: 999,
  padding: "9px 16px",
  fontFamily: "Verdana, Geneva, sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: "hsl(var(--ink-soft))",
  cursor: "pointer",
  transition: "all 0.18s ease",
};

// ─── Tab bar ─────────────────────────────────────────────────────────────────

type Tab = "mine" | "add" | "notes";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "mine", label: "My questions" },
    { key: "add", label: "Add / edit" },
    { key: "notes", label: "From notes" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Creator mode"
      style={{
        display: "flex",
        gap: 4,
        background: "hsl(var(--paper))",
        border: "1.5px solid hsl(var(--line))",
        borderRadius: 999,
        padding: 4,
        width: "fit-content",
      }}
    >
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          style={{
            background: active === key ? "hsl(var(--ink))" : "none",
            color: active === key ? "hsl(var(--paper-raised))" : "hsl(var(--ink-soft))",
            border: "none",
            padding: "9px 18px",
            fontFamily: "Verdana, Geneva, sans-serif",
            fontSize: 13.5,
            fontWeight: 600,
            borderRadius: 999,
            cursor: "pointer",
            transition: "all 0.18s ease",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Quiz bar ────────────────────────────────────────────────────────────────

function QuizBar({
  activeQuizId,
  onChange,
  refreshKey,
}: {
  activeQuizId: string;
  onChange: (quizId: string) => void;
  refreshKey: number;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(loadQuizzes);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setQuizzes(loadQuizzes());
  }, [refreshKey]);

  function handleCreate() {
    if (!newName.trim()) {
      setCreating(false);
      return;
    }
    const quiz = createQuiz(newName);
    setNewName("");
    setCreating(false);
    setQuizzes(loadQuizzes());
    onChange(quiz.id);
  }

  function handleDelete(quizId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this quiz set? Its questions will move to Uncategorized.")) return;
    deleteQuiz(quizId);
    setQuizzes(loadQuizzes());
    if (activeQuizId === quizId) onChange(UNCATEGORIZED_QUIZ_ID);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={fieldLabelStyle}>Quiz set</span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {quizzes.map((quiz) => {
          const active = quiz.id === activeQuizId;
          return (
            <div
              key={quiz.id}
              onClick={() => onChange(quiz.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: active ? "hsl(var(--ink))" : "hsl(var(--paper))",
                color: active ? "hsl(var(--paper-raised))" : "hsl(var(--ink-soft))",
                border: `1.5px solid ${active ? "hsl(var(--ink))" : "hsl(var(--line))"}`,
                borderRadius: 999,
                padding: "8px 14px",
                fontFamily: "Verdana, Geneva, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              <span>{quiz.name}</span>
              {quiz.id !== UNCATEGORIZED_QUIZ_ID && (
                <span
                  onClick={(e) => handleDelete(quiz.id, e)}
                  aria-label={`Delete ${quiz.name}`}
                  style={{ opacity: 0.75, fontWeight: 700 }}
                >
                  ✕
                </span>
              )}
            </div>
          );
        })}

        {creating ? (
          <div style={{ display: "flex", gap: 6 }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Quiz name…"
              style={{
                ...inputStyle,
                width: 160,
                padding: "8px 12px",
                fontSize: 13,
                borderRadius: 999,
              }}
            />
            <button onClick={handleCreate} style={ghostBtnStyle}>
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            style={{
              ...ghostBtnStyle,
              borderStyle: "dashed",
            }}
          >
            + New quiz
          </button>
        )}
      </div>
    </div>
  );
}

// ─── My Questions tab ─────────────────────────────────────────────────────────

function MineTab({
  onEdit,
  refreshKey,
  activeQuizId,
}: {
  onEdit: (q: Question) => void;
  refreshKey: number;
  activeQuizId: string;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [bank, setBank] = useState<Question[]>(loadBank);

  useEffect(() => {
    setBank(loadBank());
  }, [refreshKey]);

  const scoped = bank.filter((q) => q.quizId === activeQuizId);
  const categories = [...new Set(scoped.map((q) => q.category).filter(Boolean))].sort();

  const filtered = scoped
    .filter((q) => {
      const q_ = search.trim().toLowerCase();
      const matchesQ =
        !q_ ||
        q.text.toLowerCase().includes(q_) ||
        q.category.toLowerCase().includes(q_);
      const matchesCat = !catFilter || q.category === catFilter;
      return matchesQ && matchesCat;
    })
    .slice()
    .reverse();

  function handleDelete(id: string) {
    if (!confirm("Delete this question?")) return;
    const updated = loadBank().filter((q) => q.id !== id);
    saveBank(updated);
    setBank(loadBank());
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(loadBank(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pathway-question-bank.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = JSON.parse(reader.result as string);
        if (!Array.isArray(incoming)) throw new Error("not an array");
        const existing = loadBank();
        const existingIds = new Set(existing.map((q) => q.id));
        const merged = existing.concat(
          incoming.filter((q) => q && q.id && !existingIds.has(q.id))
        );
        saveBank(merged);
        setBank(loadBank());
        alert(`Imported ${incoming.length} question(s).`);
      } catch {
        alert("Could not read that file. Make sure it is a JSON export from this app.");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your questions…"
          style={{
            ...inputStyle,
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 14,
            flex: "1 1 200px",
            width: "auto",
          }}
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={{
            border: "1.5px solid hsl(var(--line))",
            borderRadius: 10,
            padding: "10px 12px",
            fontFamily: "Verdana, Geneva, sans-serif",
            fontSize: 14,
            color: "hsl(var(--ink))",
            background: "hsl(var(--paper))",
            outline: "none",
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {bank.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxHeight: 420,
            overflowY: "auto",
          }}
        >
          {filtered.map((q) => (
            <QCard key={q.id} q={q} onEdit={onEdit} onDelete={handleDelete} />
          ))}
          {filtered.length === 0 && (
            <p style={{ color: "hsl(var(--ink-soft))", fontSize: 14, textAlign: "center", padding: "16px 0" }}>
              No questions match that search.
            </p>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "24px 0", color: "hsl(var(--ink-soft))" }}>
          <p style={{ margin: "4px 0" }}>No questions yet.</p>
          <p style={{ margin: "4px 0", fontSize: 13.5 }}>
            Add one in the "Add / edit" tab, or paste notes in "From notes" to get started.
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          paddingTop: 8,
          borderTop: "1px solid hsl(var(--line))",
          fontSize: 13,
          color: "hsl(var(--ink-soft))",
        }}
      >
        <span>
          {bank.length === 1 ? "1 question saved" : `${bank.length} questions saved`}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleExport}
            style={ghostBtnStyle}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--ink))";
              (e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--ink))";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--line))";
              (e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--ink-soft))";
            }}
          >
            Export JSON
          </button>
          <label
            style={{ ...ghostBtnStyle, display: "inline-flex", alignItems: "center", cursor: "pointer" }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLLabelElement).style.borderColor = "hsl(var(--ink))";
              (e.currentTarget as HTMLLabelElement).style.color = "hsl(var(--ink))";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLLabelElement).style.borderColor = "hsl(var(--line))";
              (e.currentTarget as HTMLLabelElement).style.color = "hsl(var(--ink-soft))";
            }}
          >
            Import JSON
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={handleImport}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function QCard({
  q,
  onEdit,
  onDelete,
}: {
  q: Question;
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        border: "1.5px solid hsl(var(--line))",
        borderRadius: 14,
        padding: "14px 16px",
        background: "hsl(var(--paper))",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "hsl(var(--clay))",
            }}
          >
            {q.category || "Uncategorized"}
          </div>
          <div
            style={{
              fontSize: 15,
              color: "hsl(var(--ink))",
              lineHeight: 1.4,
              marginTop: 4,
            }}
          >
            {q.text}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "hsl(var(--sage))",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            Correct: {LETTERS[q.correctIndex]} — {q.options[q.correctIndex]}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {(["edit", "delete"] as const).map((action) => (
            <IconBtn
              key={action}
              label={action === "edit" ? "Edit" : "Delete"}
              icon={action === "edit" ? "✎" : "✕"}
              onClick={() => (action === "edit" ? onEdit(q) : onDelete(q.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none",
        border: `1.5px solid ${hov ? "hsl(var(--clay))" : "hsl(var(--line))"}`,
        borderRadius: 8,
        width: 30,
        height: 30,
        fontSize: 13,
        cursor: "pointer",
        color: hov ? "hsl(var(--clay))" : "hsl(var(--ink-soft))",
        transition: "all 0.15s ease",
      }}
    >
      {icon}
    </button>
  );
}

// ─── Add/Edit tab ─────────────────────────────────────────────────────────────

interface FormState {
  editId: string;
  category: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number | null;
  explanation: string;
}

const BLANK_FORM: FormState = {
  editId: "",
  category: "",
  text: "",
  options: ["", "", "", ""],
  correctIndex: null,
  explanation: "",
};

function AddEditTab({
  prefill,
  onSaved,
  activeQuizId,
}: {
  prefill: FormState | null;
  onSaved: () => void;
  activeQuizId: string;
}) {
  const [form, setForm] = useState<FormState>(prefill ?? BLANK_FORM);

  useEffect(() => {
    if (prefill) setForm(prefill);
  }, [prefill]);

  function reset() {
    setForm(BLANK_FORM);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.correctIndex === null) {
      alert("Pick which option is correct before saving.");
      return;
    }
    if (form.options.some((o) => !o.trim())) {
      alert("Fill in all four options.");
      return;
    }

    const bank = loadBank();
    const existing = form.editId ? bank.find((q) => q.id === form.editId) : undefined;
    const payload: Question = {
      id:
        form.editId ||
        "q-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      quizId: existing?.quizId ?? activeQuizId,
      category: form.category.trim() || "Uncategorized",
      text: form.text.trim(),
      options: form.options.map((o) => o.trim()) as Question["options"],
      correctIndex: form.correctIndex,
      explanation: form.explanation.trim(),
    };

    if (form.editId) {
      const idx = bank.findIndex((q) => q.id === form.editId);
      if (idx !== -1) bank[idx] = payload;
      else bank.push(payload);
    } else {
      bank.push(payload);
    }

    saveBank(bank);
    reset();
    onSaved();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Category */}
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={fieldLabelStyle}>Category</span>
        <input
          type="text"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          placeholder="e.g. General knowledge, History, Science"
          required
          style={inputStyle}
        />
      </label>

      {/* Question text */}
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={fieldLabelStyle}>Question</span>
        <textarea
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          rows={2}
          placeholder="Type the corrected question in clear English…"
          required
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </label>

      {/* Options grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {LETTERS.map((letter, i) => (
          <label key={letter} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={fieldLabelStyle}>Option {letter}</span>
            <input
              type="text"
              value={form.options[i]}
              onChange={(e) => {
                const opts = [...form.options] as Question["options"];
                opts[i] = e.target.value;
                setForm((f) => ({ ...f, options: opts }));
              }}
              required
              style={inputStyle}
            />
          </label>
        ))}
      </div>

      {/* Correct answer picker */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={fieldLabelStyle}>Correct answer</span>
        <div style={{ display: "flex", gap: 8 }}>
          {LETTERS.map((letter, i) => (
            <CorrectOpt
              key={letter}
              label={letter}
              selected={form.correctIndex === i}
              onClick={() => setForm((f) => ({ ...f, correctIndex: i }))}
            />
          ))}
        </div>
      </div>

      {/* Explanation */}
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={fieldLabelStyle}>
          Explanation{" "}
          <span style={{ fontWeight: 400, fontStyle: "italic", color: "#A39C8C" }}>
            optional, shown after answering
          </span>
        </span>
        <textarea
          value={form.explanation}
          onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
          rows={2}
          placeholder="Why is this the right answer?"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </label>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
        <button type="button" onClick={reset} style={ghostBtnStyle}>
          Clear
        </button>
        <button
          type="submit"
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
            transition: "background 0.18s ease",
          }}
        >
          {form.editId ? "Save changes" : "Save question"}
        </button>
      </div>
    </form>
  );
}

function CorrectOpt({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        border: selected
          ? "1.5px solid hsl(var(--sage))"
          : `1.5px solid ${hov ? "hsl(var(--sage))" : "hsl(var(--line))"}`,
        background: selected ? "hsl(var(--sage))" : "hsl(var(--paper))",
        fontFamily: "Verdana, Geneva, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: selected
          ? "hsl(var(--paper-raised))"
          : hov
          ? "hsl(var(--sage))"
          : "hsl(var(--ink-soft))",
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      {label}
    </button>
  );
}

// ─── From Notes tab ───────────────────────────────────────────────────────────

function NotesTab({ onUseChunk }: { onUseChunk: (text: string) => void }) {
  const [raw, setRaw] = useState("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [used, setUsed] = useState<Set<number>>(new Set());

  function split() {
    const trimmed = raw.trim();
    if (!trimmed) return;
    let pieces = trimmed
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (pieces.length <= 1) {
      pieces = trimmed
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    setChunks(pieces);
    setUsed(new Set());
  }

  function useChunk(i: number, text: string) {
    setUsed((prev) => new Set([...prev, i]));
    onUseChunk(text);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "hsl(var(--ink-soft))", lineHeight: 1.5, margin: 0 }}>
        Paste a chunk of notes or the original (badly translated) question text below.
        We'll split it into pieces you can quickly turn into questions one at a time —
        no need to write each one from scratch.
      </p>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={6}
        placeholder="Paste text here, one fact or question per line works best…"
        style={{ ...inputStyle, resize: "vertical" }}
      />
      <button
        type="button"
        onClick={split}
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
          alignSelf: "flex-start",
        }}
      >
        Split into pieces
      </button>

      {chunks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {chunks.map((chunk, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "hsl(var(--paper))",
                border: "1.5px solid hsl(var(--line))",
                borderRadius: 12,
                padding: "12px 14px",
                opacity: used.has(i) ? 0.45 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <span style={{ flex: 1, fontSize: 14, color: "hsl(var(--ink))", lineHeight: 1.4 }}>
                {chunk}
              </span>
              <button
                onClick={() => useChunk(i, chunk)}
                style={{
                  background: "hsl(var(--ink))",
                  color: "hsl(var(--paper-raised))",
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.18s ease",
                  fontFamily: "Verdana, Geneva, sans-serif",
                }}
                onMouseOver={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "hsl(var(--clay))")
                }
                onMouseOut={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "hsl(var(--ink))")
                }
              >
                Use this
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Create() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const mode = params.get("mode");
  const initialTab: Tab =
    mode === "new" ? "notes" : mode === "edit" ? "mine" : "mine";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [addPrefill, setAddPrefill] = useState<FormState | null>(null);
  const [mineKey, setMineKey] = useState(0);
  const [activeQuizId, setActiveQuizId] = useState<string>(UNCATEGORIZED_QUIZ_ID);

  function handleEditQ(q: Question) {
    setAddPrefill({
      editId: q.id,
      category: q.category,
      text: q.text,
      options: [...q.options] as FormState["options"],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    });
    setTab("add");
  }

  function handleSaved() {
    setMineKey((k) => k + 1);
    setTab("mine");
  }

  function handleUseChunk(text: string) {
    setAddPrefill({
      ...BLANK_FORM,
      text,
    });
    setTab("add");
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
        paddingTop: 60,
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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 640,
          background: "hsl(var(--paper-raised))",
          border: "1px solid hsl(var(--line))",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-warm-1), var(--shadow-warm-2)",
          padding: "40px 40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {/* Header */}
        <div>
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
            Create
          </p>
          <h2
            style={{
              margin: "6px 0 0",
              fontSize: "1.6rem",
              fontWeight: 500,
              color: "hsl(var(--ink))",
              fontStyle: "normal",
            }}
          >
            Fix and build your study bank
          </h2>
          <p style={{ marginTop: 8, fontSize: 14, color: "hsl(var(--ink-soft))", lineHeight: 1.5 }}>
            Everything here is saved on this device. Use it to build flashcard sets or add new questions from your own notes.
          </p>
        </div>

        <QuizBar activeQuizId={activeQuizId} onChange={setActiveQuizId} refreshKey={mineKey} />

        <TabBar active={tab} onChange={setTab} />

        {tab === "mine" && (
          <MineTab onEdit={handleEditQ} refreshKey={mineKey} activeQuizId={activeQuizId} />
        )}
        {tab === "add" && (
          <AddEditTab prefill={addPrefill} onSaved={handleSaved} activeQuizId={activeQuizId} />
        )}
        {tab === "notes" && (
          <NotesTab onUseChunk={handleUseChunk} />
        )}
      </div>
      <Footer />
    </div>
  );
}
