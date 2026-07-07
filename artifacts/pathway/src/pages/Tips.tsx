import { useMemo, useState } from "react";
import Footer from "../components/Footer";
import { TIPS, SOURCE_URL, SOURCE_LABEL } from "../lib/tipsData";

const FF = "Verdana, Geneva, sans-serif";

export default function Tips() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    TIPS.forEach((t) => t.category && set.add(t.category));
    return Array.from(set);
  }, []);

  const filteredTips = useMemo(() => {
    if (activeCategory === "all") return TIPS;
    return TIPS.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center px-4 relative"
      style={{ background: "hsl(var(--paper))", paddingTop: 90, paddingBottom: 60 }}
    >
      <button
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 text-sm font-medium flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl"
        style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--ink-soft))" }}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(var(--clay))", margin: 0, fontFamily: FF }}>
            Tips
          </p>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "hsl(var(--ink))", fontFamily: FF }}>
            ADHD tips & tricks
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "hsl(var(--ink-soft))", fontFamily: FF }}>
            Bite-sized strategies you can try today.
          </p>
        </div>

        {/* Category filter pills */}
        {categories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(["all", ...categories] as string[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? "hsl(var(--clay))" : "none",
                  color: activeCategory === cat ? "hsl(var(--paper-raised))" : "hsl(var(--ink-soft))",
                  border: "1.5px solid",
                  borderColor: activeCategory === cat ? "hsl(var(--clay))" : "hsl(var(--line))",
                  borderRadius: 999,
                  padding: "6px 14px",
                  fontFamily: FF,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Tips grid / empty state */}
        {filteredTips.length === 0 ? (
          <div
            style={{
              border: "1.5px dashed hsl(var(--line))",
              borderRadius: 14,
              padding: "32px 20px",
              textAlign: "center",
              color: "hsl(var(--ink-soft))",
              fontFamily: FF,
              fontSize: 13.5,
            }}
          >
            No tips here yet — check back soon.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {filteredTips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        )}

        {/* Source credit */}
        {SOURCE_URL && (
          <p style={{ margin: 0, fontSize: 11.5, color: "hsl(var(--ink-soft))", fontFamily: FF }}>
            {SOURCE_LABEL}:{" "}
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "hsl(var(--clay))", textDecoration: "underline" }}
            >
              {SOURCE_URL}
            </a>
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
}

// ─── TipCard ──────────────────────────────────────────────────────────────────

interface TipCardProps {
  tip: { id: string; title: string; description: string; category?: string };
}

function TipCard({ tip }: TipCardProps) {
  return (
    <div
      style={{
        background: "hsl(var(--paper))",
        border: "1.5px solid hsl(var(--line))",
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {tip.category && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "hsl(var(--clay))",
            fontFamily: "Verdana, Geneva, sans-serif",
          }}
        >
          {tip.category}
        </span>
      )}
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "hsl(var(--ink))", fontFamily: "Verdana, Geneva, sans-serif" }}>
        {tip.title}
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: "hsl(var(--ink-soft))", lineHeight: 1.55, fontFamily: "Verdana, Geneva, sans-serif" }}>
        {tip.description}
      </p>
    </div>
  );
}
