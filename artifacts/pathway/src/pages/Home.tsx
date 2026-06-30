import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";

type Step = "welcome" | "intent" | "learn-detail" | "focus-detail" | "plan-detail" | "build-detail" | "redirecting";

const trailPaths: Record<string, string> = {
  learn: "M160,420 C160,360 110,330 90,260",
  focus: "M160,420 C160,360 160,330 160,250",
  plan: "M160,420 C160,360 190,330 200,260",
  build: "M160,420 C160,360 225,330 240,270",
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("welcome");
  const [intent, setIntent] = useState<string | null>(null);
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [intent, step]);

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
      
      {/* SVG Background Trail */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-end" aria-hidden="true">
        <svg width="320" height="420" viewBox="0 0 320 420" className="opacity-60 mb-24">
          {/* Base trunk */}
          <path 
            d="M160,420 L160,360" 
            fill="none" 
            stroke={step !== "welcome" ? "var(--color-clay)" : "var(--color-line)"} 
            strokeWidth="3" 
            strokeLinecap="round"
            className="transition-colors duration-700"
          />
          {/* Active branch */}
          {intent && (
            <path
              ref={pathRef}
              d={trailPaths[intent]}
              fill="none"
              stroke="var(--color-clay)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={step === "redirecting" || step.endsWith("-detail") ? 0 : pathLength}
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>
      </div>

      <div className="card-container flex flex-col items-center text-center">
        {step === "welcome" && (
          <div className="step-enter flex flex-col items-center w-full">
            <span className="text-ink-soft text-sm font-medium tracking-wide uppercase mb-6" data-testid="text-eyebrow">Pathway</span>
            <h1 className="text-4xl text-ink mb-4" data-testid="text-heading">What do you need right now?</h1>
            <p className="text-ink-soft mb-10 leading-relaxed" data-testid="text-subtitle">Take a breath. Choose a path for this session.</p>
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
            <h2 className="text-2xl text-ink mb-6 text-center" data-testid="text-heading-intent">I need to...</h2>
            <div className="space-y-3">
              <button className="btn-choice group" onClick={() => handleIntent("learn")} data-testid="choice-learn">
                <span className="font-medium text-[17px]">Learn or review something</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleIntent("focus")} data-testid="choice-focus">
                <span className="font-medium text-[17px]">Get focused and do a task</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleIntent("plan")} data-testid="choice-plan">
                <span className="font-medium text-[17px]">See what's ahead / get organised</span>
                <ChevronRight className="w-5 h-5 text-ink-soft opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
              <button className="btn-choice group" onClick={() => handleIntent("build")} data-testid="choice-build">
                <span className="font-medium text-[17px]">Fix or build study material</span>
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
          Skip — show me everything
        </button>
      </div>

    </div>
  );
}
