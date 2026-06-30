import { Link } from "wouter";
import { Timer, BookOpen, CalendarDays, PenLine } from "lucide-react";

const modules = [
  {
    id: "focus",
    label: "Focus",
    description: "Pomodoro-style timer with work and break cycles.",
    icon: Timer,
    href: "/focus",
    status: "ready" as const,
    accentVar: "--color-clay",
    bgVar: "hsl(18 54% 49% / 0.1)",
  },
  {
    id: "study",
    label: "Study",
    description: "Category practice and mock exam mode for driving theory.",
    icon: BookOpen,
    href: "/study",
    status: "coming-soon" as const,
    accentVar: "--color-clay",
    bgVar: "hsl(18 52% 81% / 0.25)",
  },
  {
    id: "plan",
    label: "Plan",
    description: "Daily and weekly overview of your tasks and sessions.",
    icon: CalendarDays,
    href: "/plan",
    status: "coming-soon" as const,
    accentVar: "--color-sage",
    bgVar: "hsl(92 11% 49% / 0.1)",
  },
  {
    id: "create",
    label: "Create",
    description: "Build and fix study questions from your notes.",
    icon: PenLine,
    href: "/create",
    status: "coming-soon" as const,
    accentVar: "--color-dusty-blue",
    bgVar: "hsl(210 25% 48% / 0.1)",
  },
];

export default function Hub() {
  return (
    <div className="min-h-[100dvh] w-full bg-paper px-4 py-16 flex flex-col items-center">
      <div className="w-full max-w-[520px] flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-clay" data-testid="text-eyebrow">
            Pathway
          </p>
          <h1 className="text-4xl text-ink leading-tight" data-testid="text-heading">
            Everything
          </h1>
          <p className="text-ink-soft leading-relaxed" data-testid="text-subtitle">
            All four modules in one place. Use the branching flow to find the right one, or jump directly from here.
          </p>
        </div>

        {/* Module grid */}
        <div className="flex flex-col gap-3" data-testid="module-grid">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isReady = mod.status === "ready";
            return (
              <Link
                key={mod.id}
                href={mod.href}
                className="card-container flex items-start gap-4 no-underline hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
                data-testid={`card-module-${mod.id}`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: mod.bgVar }}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" style={{ color: `var(${mod.accentVar})` }} />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink" data-testid={`text-module-label-${mod.id}`}>
                      {mod.label}
                    </span>
                    {isReady ? (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "hsl(18 54% 49% / 0.1)", color: "var(--color-clay)" }}
                        data-testid={`badge-status-${mod.id}`}
                      >
                        Ready
                      </span>
                    ) : (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full border-[1.5px]"
                        style={{ borderColor: "var(--color-line)", color: "var(--color-ink-soft)" }}
                        data-testid={`badge-status-${mod.id}`}
                      >
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-soft leading-snug" data-testid={`text-module-desc-${mod.id}`}>
                    {mod.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Back to onboarding */}
        <div className="flex justify-center pt-2">
          <Link
            href="/"
            className="text-ink-soft hover:text-ink text-sm font-medium transition-colors"
            data-testid="link-back-to-pathway"
          >
            Back to Pathway
          </Link>
        </div>
      </div>
    </div>
  );
}
