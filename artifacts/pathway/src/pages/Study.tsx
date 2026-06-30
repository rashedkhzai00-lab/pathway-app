import { Link } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function Study() {
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
          Study
        </p>

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--color-clay-soft)" }}
          aria-hidden="true"
        >
          <BookOpen className="w-8 h-8" style={{ color: "var(--color-clay)" }} />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-3xl text-ink leading-tight" data-testid="text-heading">
            Driving theory practice
          </h2>
          <p className="text-ink-soft leading-relaxed" data-testid="text-subtitle">
            Category practice, mock exams, and weak-spot drilling are coming here next.
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
            style={{ background: "var(--color-clay-soft)" }}
          />
          Coming soon
        </div>

        {/* Planned features */}
        <div className="flex flex-col gap-3 pt-2 border-t border-line">
          {[
            "Practice by category",
            "Full mock exam mode",
            "Weak-spot drilling",
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
