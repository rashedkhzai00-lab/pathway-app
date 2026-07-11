import { useEffect, useState } from "react";
import { checkPinAvailable, createPinSave, restorePinSave, deletePinSave } from "../utils/pinSync";

type Mode = "closed" | "menu" | "create" | "restore" | "success";

const FF = "Verdana, Geneva, sans-serif";

export default function PinSaveModal() {
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [mode, setMode] = useState<Mode>("closed");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSavedPin, setHasSavedPin] = useState(
    () => !!localStorage.getItem("adhdrive_has_pin"),
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/healthz")
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("application/json")) return null;
        return res.json() as Promise<unknown>;
      })
      .then((body) => {
        if (!cancelled && body) setBackendAvailable(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  function reset() {
    setPin("");
    setConfirmPin("");
    setError("");
    setLoading(false);
  }

  function close() {
    setMode("closed");
    reset();
  }

  function isValidPin(v: string) {
    return /^\d{4}$/.test(v);
  }

  async function handleCreate() {
    setError("");
    if (!isValidPin(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs don't match. Try again.");
      return;
    }
    setLoading(true);
    try {
      const { available } = await checkPinAvailable(pin);
      if (!available) {
        setError("That PIN is taken — try a different one.");
        return;
      }
      await createPinSave(pin);
      localStorage.setItem("adhdrive_has_pin", "true");
      setHasSavedPin(true);
      setMode("success");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setError("");
    if (!isValidPin(pin)) {
      setError("Enter your 4-digit PIN.");
      return;
    }
    setLoading(true);
    try {
      await restorePinSave(pin);
      localStorage.setItem("adhdrive_has_pin", "true");
      setHasSavedPin(true);
      setMode("success");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No save found for that PIN.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete your saved backup permanently?")) return;
    if (!isValidPin(pin)) {
      setError("Enter your 4-digit PIN to confirm deletion.");
      return;
    }
    setLoading(true);
    try {
      await deletePinSave(pin);
      localStorage.removeItem("adhdrive_has_pin");
      setHasSavedPin(false);
      close();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!backendAvailable) return null;

  if (mode === "closed") {
    return (
      <button
        onClick={() => setMode("menu")}
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 999,
          border: "1.5px solid hsl(var(--line))",
          background: "hsl(var(--paper-raised))",
          cursor: "pointer",
          zIndex: 40,
          boxShadow: "var(--shadow-warm-1)",
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "hsl(var(--clay))", fontFamily: FF, letterSpacing: "0.04em" }}>
          PIN
        </span>
        {hasSavedPin && (
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(var(--sage))", display: "inline-block" }} />
        )}
      </button>
    );
  }

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "hsl(var(--paper-raised))",
          borderRadius: 20,
          padding: "28px 28px 24px",
          maxWidth: 340,
          width: "calc(100% - 40px)",
          boxShadow: "var(--shadow-warm-1), var(--shadow-warm-2)",
          border: "1px solid hsl(var(--line))",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          fontFamily: FF,
        }}
      >
        {mode === "menu" && (
          <>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700, color: "hsl(var(--ink))" }}>
              Backup your data
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "hsl(var(--ink-soft))", lineHeight: 1.55 }}>
              Save your questions, tasks, and streaks behind a 4-digit PIN.
              Restore them on any browser anytime.
            </p>
            <Btn primary onClick={() => { reset(); setMode("create"); }}>Set up a PIN</Btn>
            <Btn onClick={() => { reset(); setMode("restore"); }}>Restore from a PIN</Btn>
            <CancelBtn onClick={close}>Cancel</CancelBtn>
          </>
        )}

        {mode === "create" && (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 700, color: "hsl(var(--ink))" }}>
              Choose a 4-digit PIN
            </h2>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "hsl(var(--ink-soft))", lineHeight: 1.5 }}>
              Anyone who knows this PIN can restore your data — don't use something obvious.
              This is a convenience backup, not encrypted storage.
            </p>
            <PinInput value={pin} placeholder="Enter PIN" onChange={setPin} />
            <PinInput value={confirmPin} placeholder="Confirm PIN" onChange={setConfirmPin} />
            {error && <ErrMsg>{error}</ErrMsg>}
            <Btn primary onClick={handleCreate} disabled={loading}>
              {loading ? "Saving…" : "Save my data"}
            </Btn>
            <CancelBtn onClick={() => setMode("menu")}>Back</CancelBtn>
          </>
        )}

        {mode === "restore" && (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 700, color: "hsl(var(--ink))" }}>
              Restore your data
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "hsl(var(--ink-soft))", lineHeight: 1.5 }}>
              Enter your 4-digit PIN to load your saved data into this browser.
            </p>
            <PinInput value={pin} placeholder="Enter your PIN" onChange={setPin} />
            {error && <ErrMsg>{error}</ErrMsg>}
            <Btn primary onClick={handleRestore} disabled={loading}>
              {loading ? "Restoring…" : "Restore"}
            </Btn>
            {hasSavedPin && (
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "hsl(0 60% 50%)",
                  marginTop: 10,
                  marginBottom: 4,
                  textDecoration: "underline",
                  fontFamily: FF,
                }}
              >
                Delete this backup
              </button>
            )}
            <CancelBtn onClick={() => setMode("menu")}>Back</CancelBtn>
          </>
        )}

        {mode === "success" && (
          <>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700, color: "hsl(var(--ink))" }}>
              Done ✓
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "hsl(var(--ink-soft))", lineHeight: 1.55 }}>
              Your data is saved. Remember your PIN — it's the only way to get it back.
            </p>
            <Btn primary onClick={close}>Got it</Btn>
          </>
        )}
      </div>
    </div>
  );
}

function Btn({ children, primary, onClick, disabled }: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "10px 0",
        borderRadius: 10,
        border: primary ? "none" : "1.5px solid hsl(var(--line))",
        background: primary ? "hsl(var(--clay))" : "none",
        color: primary ? "hsl(var(--paper-raised))" : "hsl(var(--ink))",
        fontFamily: FF,
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        marginBottom: 8,
      }}
    >
      {children}
    </button>
  );
}

function PinInput({ value, placeholder, onChange }: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="password"
      inputMode="numeric"
      maxLength={4}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      placeholder={placeholder}
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1.5px solid hsl(var(--line))",
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 10,
        textAlign: "center",
        letterSpacing: "0.35em",
        fontSize: 20,
        fontFamily: FF,
        background: "hsl(var(--paper))",
        color: "hsl(var(--ink))",
        outline: "none",
      }}
    />
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "hsl(0 65% 50%)", fontFamily: FF }}>
      {children}
    </p>
  );
}

function CancelBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        color: "hsl(var(--ink-soft))",
        fontFamily: FF,
        marginTop: 4,
        width: "100%",
      }}
    >
      {children}
    </button>
  );
}
