import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Palette, Check } from "lucide-react";
import { useTheme, type Theme } from "../hooks/useTheme";
import Footer from "../components/Footer";

const themeOptions: { id: Theme; label: string; swatch: string }[] = [
  { id: "light", label: "Light", swatch: "hsl(40 33% 95%)" },
  { id: "dark",  label: "Dark",  swatch: "hsl(220 13% 13%)" },
  { id: "warm",  label: "Warm",  swatch: "hsl(30 42% 90%)" },
];

type Step = "welcome" | "intent" | "learn-detail" | "focus-detail" | "plan-detail" | "build-detail" | "redirecting";

export default function Home() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("welcome");
  const [intent, setIntent] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!themeOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [themeOpen]);

  const handleIntent = (selectedIntent: "learn" | "focus" | "plan" | "build") => {
    setIntent(selectedIntent);
    setStep(`${selectedIntent}-detail` as Step);
  };

  const handleRedirect = (path: string, payload?: Record<string, string>) => {
    setStep("redirecting");
    
    // Save to local storage
    try {
      const answers = JSON.parse(localStorage.getItem('pathway:lastAnswers') || '{}');
      localStorage.setItem('pathway:lastAnswers', JSON.stringify({ ...answers, intent, ...payload }));
    } catch (e) {}

    setTimeout(() => {
      setLocation(path);
    }, 1200);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-paper relative overflow-hidden px-4">

      {/* Theme dropdown — top-right corner */}
      <div ref={dropdownRef} style={{ position: "absolute", top: 16, right: 16, zIndex: 50 }}>
        <button
          onClick={() => setThemeOpen((o) => !o)}
          aria-label="Change theme"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 13px",
            borderRadius: 999,
            border: "1.5px solid hsl(var(--line))",
            background: "hsl(var(--paper-raised))",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "hsl(var(--ink-soft))",
            fontFamily: "Verdana, Geneva, sans-serif",
            transition: "all 0.15s ease",
          }}
        >
          <Palette size={14} />
          {themeOptions.find((t) => t.id === theme)?.label ?? "Light"}
        </button>

        {themeOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              background: "hsl(var(--paper-raised))",
              border: "1.5px solid hsl(var(--line))",
              borderRadius: 14,
              boxShadow: "var(--shadow-warm-2)",
              overflow: "hidden",
              minWidth: 140,
            }}
          >
            {themeOptions.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 14px",
                    border: "none",
                    background: active ? "hsl(var(--clay-soft))" : "transparent",
                    cursor: "pointer",
                    fontFamily: "Verdana, Geneva, sans-serif",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? "hsl(var(--clay))" : "hsl(var(--ink))",
                    textAlign: "left",
                    transition: "background 0.1s",
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: t.swatch,
                      border: "1.5px solid hsl(var(--line))",
                      flexShrink: 0,
                    }}
                  />
                  {t.label}
                  {active && <Check size={12} style={{ marginLeft: "auto", color: "hsl(var(--clay))" }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="card-container flex flex-col items-center text-center">
        {step === "welcome" && (
          <div className="step-enter flex flex-col items-center w-full">
            <span className="text-ink-soft text-sm font-medium tracking-wide uppercase mb-6" data-testid="text-eyebrow">ADHDrive</span>
            <h1 className="text-4xl text-ink mb-4" data-testid="text-heading">What do you need right now?</h1>
            <p className="text-ink-soft mb-10 leading-relaxed" data-testid="text-subtitle">No pressure. Just pick what feels right.</p>
            <button 
              className="btn-primary w-full max-w-[240px]"
              onClick={() => setStep("intent")}
              data-testid="button-start"
            >
              Let's see
            </button>
          </div>
        )}

        {step === "intent" && (
          <div className="step-enter flex flex-col w-full text-left">
            <h2 className="text-2xl text-ink mb-6 text-center" data-testid="text-heading-intent">Right now I want to...</h2>
            <div className="space-y-3">
              <button className="btn-choice group" onClick={() => handleIntent("learn")} data-testid="choice-learn">
                <span className="font-medium text-[17px]">Study something</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleIntent("focus")} data-testid="choice-focus">
                <span className="font-medium text-[17px]">Actually focus for a bit</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleIntent("plan")} data-testid="choice-plan">
                <span className="font-medium text-[17px]">See what's ahead / get organised</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleIntent("build")} data-testid="choice-build">
                <span className="font-medium text-[17px]">Make or fix my notes</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </div>
        )}

        {step === "learn-detail" && (
          <div className="step-enter flex flex-col w-full text-left">
            <h2 className="text-2xl text-ink mb-6 text-center">What are you reviewing?</h2>
            <div className="space-y-3">
              <button className="btn-choice group" onClick={() => handleRedirect("/study", { review: 'theory' })}>
                <span className="font-medium text-[17px]">Driving theory test</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleRedirect("/study?mode=generic", { review: 'other' })}>
                <span className="font-medium text-[17px]">Something else</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </div>
        )}

        {step === "focus-detail" && (
          <div className="step-enter flex flex-col w-full text-left">
            <h2 className="text-2xl text-ink mb-6 text-center">How long do you have?</h2>
            <div className="space-y-3">
              <button className="btn-choice group" onClick={() => handleRedirect("/focus?len=15", { length: '15' })}>
                <span className="font-medium text-[17px]">15 minutes</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleRedirect("/focus?len=25", { length: '25' })}>
                <span className="font-medium text-[17px]">25 minutes</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleRedirect("/focus?len=50", { length: '50' })}>
                <span className="font-medium text-[17px]">50 minutes</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </div>
        )}

        {step === "plan-detail" && (
          <div className="step-enter flex flex-col w-full text-left">
            <h2 className="text-2xl text-ink mb-6 text-center">What do you want to see?</h2>
            <div className="space-y-3">
              <button className="btn-choice group" onClick={() => handleRedirect("/plan?view=today", { view: 'today' })}>
                <span className="font-medium text-[17px]">Just today</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleRedirect("/plan?view=week", { view: 'week' })}>
                <span className="font-medium text-[17px]">This week</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </div>
        )}

        {step === "build-detail" && (
          <div className="step-enter flex flex-col w-full text-left">
            <h2 className="text-2xl text-ink mb-6 text-center">What kind of material?</h2>
            <div className="space-y-3">
              <button className="btn-choice group" onClick={() => handleRedirect("/create?type=fix", { type: 'fix' })}>
                <span className="font-medium text-[17px]">Fix existing questions</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleRedirect("/create?type=new", { type: 'new' })}>
                <span className="font-medium text-[17px]">Create new ones from notes</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </div>
        )}

        {step === "redirecting" && (
          <div className="step-enter flex flex-col items-center justify-center py-8">
            <div className="spinner mb-6"></div>
            <p className="text-ink text-lg font-serif">Taking you there...</p>
          </div>
        )}
      </div>

      <div className="mt-8 z-20">
        <button 
          onClick={() => setLocation("/hub")}
          className="text-ink-soft hover:text-ink text-sm font-medium transition-colors"
          data-testid="link-hub"
        >
          Just take me to the app
        </button>
      </div>

      <Footer />
    </div>
  );
}
