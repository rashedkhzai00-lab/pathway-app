import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Palette, Check } from "lucide-react";
import { useTheme, type Theme } from "../hooks/useTheme";
import Footer from "../components/Footer";

const themeOptions: { id: Theme; label: string; swatch: string }[] = [
  { id: "light", label: "Light", swatch: "hsl(40 33% 95%)" },
  { id: "dark",  label: "Dark",  swatch: "hsl(220 13% 13%)" },
  { id: "warm",  label: "Warm",  swatch: "hsl(30 42% 90%)" },
];

const LAST_FEATURE_KEY = "pathway:lastUsedFeature";
const ROUTING_LOG_KEY = "pathway:routingLog";

type RouteOption = {
  id: string;
  label: string;
  path: string;
};

const routeOptions: RouteOption[] = [
  { id: "distracted", label: "I keep getting distracted", path: "/focus" },
  { id: "no-start", label: "I don't know where to start", path: "/plan?view=today" },
  { id: "forgot-log", label: "I need to plan my days and tasks", path: "/plan?view=week" },
  { id: "test-coming", label: "I have a test coming up", path: "/study" },
];

function logRoutingChoice(choice: string) {
  try {
    const log = JSON.parse(localStorage.getItem(ROUTING_LOG_KEY) || "[]");
    log.push({ choice, timestamp: Date.now() });
    localStorage.setItem(ROUTING_LOG_KEY, JSON.stringify(log.slice(-200)));
  } catch (e) {}
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);
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

  const goTo = (path: string, choiceId: string) => {
    logRoutingChoice(choiceId);
    setRedirecting(true);
    setTimeout(() => {
      setLocation(path);
    }, 900);
  };

  const handleSurpriseMe = () => {
    let path = "/focus";
    try {
      const last = localStorage.getItem(LAST_FEATURE_KEY);
      if (last) path = last;
    } catch (e) {}
    goTo(path, "surprise-me");
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
        {!redirecting ? (
          <div className="step-enter flex flex-col w-full">
            <span className="text-ink-soft text-sm font-medium tracking-wide uppercase mb-6" data-testid="text-eyebrow">
              ADHDrive
            </span>
            <h1 className="text-2xl text-ink mb-6" data-testid="text-heading">
              What's going on right now?
            </h1>
            <div className="space-y-3 text-left">
              {routeOptions.map((opt) => (
                <button
                  key={opt.id}
                  className="btn-choice"
                  onClick={() => goTo(opt.path, opt.id)}
                  data-testid={`choice-${opt.id}`}
                >
                  <span className="font-medium text-[17px]">{opt.label}</span>
                </button>
              ))}
            </div>
            <button
              className="mt-4 w-full text-center text-sm font-medium text-ink-soft hover:text-ink py-3 rounded-[18px] border-[1.5px] border-dashed border-line transition-colors"
              onClick={handleSurpriseMe}
              data-testid="choice-surprise-me"
            >
              Just start something
            </button>
          </div>
        ) : (
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
