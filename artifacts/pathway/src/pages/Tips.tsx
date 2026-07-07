import { useMemo, useState } from "react";
import Footer from "../components/Footer";
import { TIPS, TIP_CATEGORIES, SOURCE_URL, DISCLAIMER } from "../lib/tipsData";

const FF = "Verdana, Geneva, sans-serif";

export default function Tips() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

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
        style={{ position: "absolute", top: 24, left: 24, background: "none", border: "none", cursor: "pointer", color: "hsl(var(--ink-soft))", fontSize: 13, fontWeight: 600, fontFamily: FF }}
      >
        ← Back
      </button>

      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "hsl(var(--paper-raised))",
          border: "1px solid hsl(var(--line))",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-warm-1), var(--shadow-warm-2)",
          padding: "36px 36px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(var(--clay))", fontFamily: FF }}>
            Tips
          </p>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "hsl(var(--ink))", fontFamily: FF }}>
            ADHD tips & tricks
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "hsl(var(--ink-soft))", fontFamily: FF }}>
            Bite-sized strategies you can try today.
          </p>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            background: "hsl(var(--sage) / 0.12)",
            border: "1px solid hsl(var(--sage) / 0.35)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12.5,
            color: "hsl(var(--ink-soft))",
            lineHeight: 1.55,
            fontFamily: FF,
          }}
        >
          {DISCLAIMER}
        </div>

        {/* Category filter pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <FilterPill label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
          {TIP_CATEGORIES.map((cat) => (
            <FilterPill key={cat.id} label={cat.label} active={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)} />
          ))}
        </div>

        {/* Tips content */}
        {activeCategory === "all" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {TIP_CATEGORIES.map((cat) => {
              const catTips = TIPS.filter((t) => t.category === cat.id);
              if (catTips.length === 0) return null;
              return <Section key={cat.id} label={cat.label} tips={catTips} />;
            })}
          </div>
        ) : (
          (() => {
            const cat = TIP_CATEGORIES.find((c) => c.id === activeCategory);
            return filteredTips.length === 0 ? (
              <EmptyState />
            ) : (
              <Section label={cat?.label ?? activeCategory} tips={filteredTips} />
            );
          })()
        )}

        {/* Source credit */}
        {SOURCE_URL && (
          <p style={{ margin: 0, fontSize: 11.5, color: "hsl(var(--ink-soft))", fontFamily: FF }}>
            Inspired by{" "}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--clay))", textDecoration: "underline" }}>
              this Reddit thread
            </a>
            , paraphrased by ADHDrive users.
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
}

function Section({ label, tips }: { label: string; tips: { id: string; text: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(var(--clay))", flexShrink: 0, display: "inline-block" }} />
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "hsl(var(--clay))", fontFamily: FF }}>
          {label}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tips.map((tip) => <TipCard key={tip.id} text={tip.text} />)}
      </div>
    </div>
  );
}

function TipCard({ text }: { text: string }) {
  return (
    <div
      style={{
        background: "hsl(var(--paper))",
        border: "1.5px solid hsl(var(--line))",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 14,
        color: "hsl(var(--ink))",
        lineHeight: 1.6,
        fontFamily: FF,
      }}
    >
      {text}
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "hsl(var(--clay))" : "none",
        color: active ? "hsl(var(--paper-raised))" : "hsl(var(--ink-soft))",
        border: "1.5px solid",
        borderColor: active ? "hsl(var(--clay))" : "hsl(var(--line))",
        borderRadius: 999,
        padding: "6px 14px",
        fontFamily: FF,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div style={{ border: "1.5px dashed hsl(var(--line))", borderRadius: 14, padding: "32px 20px", textAlign: "center", color: "hsl(var(--ink-soft))", fontFamily: FF, fontSize: 13.5 }}>
      No tips here yet — check back soon.
    </div>
  );
}
