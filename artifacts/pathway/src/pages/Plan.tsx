import { Link, useSearch } from "wouter";
import { ArrowLeft, CalendarDays } from "lucide-react";

export default function Plan() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const view = params.get("view") || "today";

  return (
    <div className="min-h-[100dvh] w-full bg-paper flex flex-col items-center justify-center px-4 py-12 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 text-ink-soft hover:text-ink text-sm font-medium flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-paper-raised"
        data-testid="link-back"
      >
        <ArrowLeft className="w-4 h-4" />
        Pathway
      </Link>

      <div className="card-container flex flex-col gap-6" style={{ maxWidth: 480 }}>
        <p className="text-xs font-semibold tracking-widest uppercase text-clay" data-testid="text-eyebrow">
          Plan
        </p>

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(92 11% 49% / 0.12)" }}
          aria-hidden="true"
        >
          <CalendarDays className="w-8 h-8" style={{ color: "var(--color-sage)" }} />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-3xl text-ink leading-tight" data-testid="text-heading">
            Your schedule at a glance
          </h2>
          <p className="text-ink-soft leading-relaxed" data-testid="text-subtitle">
            {view === "week"
              ? "Your week at a glance — tasks and sessions will live here."
              : "Today's tasks and focus sessions will live here."}
          </p>
        </div>

        {/* Coming soon pill */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium w-fit border-[1.5px]"
          style={{ borderColor: "var(--color-line)", color: "var(--color-ink-soft)", background: "var(--color-paper)" }}
          data-testid="badge-coming-soon"
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(92 11% 49% / 0.4)" }}
          />
          Coming soon
        </div>

        {/* Planned features */}
        <div className="flex flex-col gap-3 pt-2 border-t border-line">
          {[
            "Daily task overview",
            "Week-at-a-glance view",
            "Session scheduling",
          ].map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-3 text-ink-soft text-sm"
              data-testid={`text-feature-${feature.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <span
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: "var(--color-line)" }}
              />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
