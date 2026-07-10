import { useState } from "react";
import { checkPinAvailable, createPinSave, restorePinSave, deletePinSave } from "../utils/pinSync";

type Mode = "closed" | "menu" | "create" | "restore" | "success";

const FF = "Verdana, Geneva, sans-serif";

export default function PinSaveModal() {
  const [mode, setMode] = useState<Mode>("closed");
  const [pinLength, setPinLength] = useState<4 | 6>(6);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSavedPin, setHasSavedPin] = useState(
    () => !!localStorage.getItem("adhdrive_has_pin"),
  );

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

  async function handleCreate() {
    setError("");
    if (!/^\d{4}$|^\d{6}$/.test(pin)) {
      setError("PIN must be exactly 4 or 6 digits.");
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
        setError("That PIN is already taken — please pick a different one.");
        setLoading(false);
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
    if (!/^\d{4}$|^\d{6}$/.test(pin)) {
      setError("Enter your 4 or 6 digit PIN.");
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

  async function handleForget() {
    if (!confirm("This deletes your saved backup permanently. Continue?")) return;
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
          padding: "6px 12px",
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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={close}
    >
      <div
        style={{
          background: "hsl(var(--paper-raised))",
          borderRadius: 20,
          padding: "28px 28px 24px",
          maxWidth: 360,
          width: "calc(100% - 40px)",
          boxShadow: "var(--shadow-warm-1), var(--shadow-warm-2)",
          border: "1px solid hsl(var(--line))",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          fontFamily: FF,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "menu" && (
          <>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700, color: "hsl(var(--ink))" }}>
              Keep your data, even after clearing cache
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "hsl(var(--ink-soft))", lineHeight: 1.55 }}>
              Completely optional — ADHDrive works fine without it. This is only for people
              who want a way to restore their data after clearing browser cache or switching devices.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Btn primary onClick={() => setMode("create")}>Set up a PIN</Btn>
              <Btn onClick={() => setMode("restore")}>Restore from a PIN</Btn>
              <CancelBtn onClick={close}>Cancel</CancelBtn>
            </div>
          </>
        )}

        {mode === "create" && (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 700, color: "hsl(var(--ink))" }}>
              Choose a PIN
            </h2>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: "hsl(var(--ink-soft))", lineHeight: 1.5 }}>
              Pick 4 or 6 digits. Anyone with this PIN can restore this data — don't share it
              or use something obvious like your birth year. This is a convenience code, not bank-level security.
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "hsl(35 70% 45%)", lineHeight: 1.5 }}>
              ADHDrive is in beta. Please don't save anything highly sensitive — treat this as a
              convenience backup, not secure storage.
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <LenBtn active={pinLength === 4} onClick={() => setPinLength(4)}>4 digits</LenBtn>
              <LenBtn active={pinLength === 6} onClick={() => setPinLength(6)}>6 digits (recommended)</LenBtn>
            </div>
            <PinInput value={pin} maxLength={pinLength} placeholder={`Enter ${pinLength}-digit PIN`}
              onChange={(v) => setPin(v)} />
            <div style={{ marginBottom: 12 }}>
              <PinInput value={confirmPin} maxLength={pinLength} placeholder="Confirm PIN"
                onChange={(v) => setConfirmPin(v)} />
            </div>
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
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "hsl(var(--ink-soft))", lineHeight: 1.5 }}>
              Enter the PIN you set up before. This restores your saved data into this browser.
            </p>
            <div style={{ marginBottom: 12 }}>
              <PinInput value={pin} maxLength={6} placeholder="Enter your PIN" onChange={(v) => setPin(v)} />
            </div>
            {error && <ErrMsg>{error}</ErrMsg>}
            <Btn primary onClick={handleRestore} disabled={loading}>
              {loading ? "Restoring…" : "Restore"}
            </Btn>
            {hasSavedPin && (
              <button
                onClick={handleForget}
                disabled={loading}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "hsl(0 65% 50%)", marginTop: 10, textDecoration: "underline", fontFamily: FF }}
              >
                Delete this backup instead
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
            <Btn primary onClick={close}>Close</Btn>
          </>
        )}
      </div>
    </div>
  );
}

function Btn({ children, primary, onClick, disabled }: { children: React.ReactNode; primary?: boolean; onClick?: () => void; disabled?: boolean }) {
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
        fontFamily: "Verdana, Geneva, sans-serif",
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

function LenBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "6px 0",
        borderRadius: 8,
        border: "1.5px solid",
        borderColor: active ? "hsl(var(--clay))" : "hsl(var(--line))",
        background: active ? "hsl(var(--clay))" : "none",
        color: active ? "hsl(var(--paper-raised))" : "hsl(var(--ink-soft))",
        fontFamily: "Verdana, Geneva, sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function PinInput({ value, maxLength, placeholder, onChange }: { value: string; maxLength: number; placeholder: string; onChange: (v: string) => void }) {
  return (
    <input
      type="password"
      inputMode="numeric"
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      placeholder={placeholder}
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1.5px solid hsl(var(--line))",
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 8,
        textAlign: "center",
        letterSpacing: "0.25em",
        fontSize: 18,
        fontFamily: "Verdana, Geneva, sans-serif",
        background: "hsl(var(--paper))",
        color: "hsl(var(--ink))",
        outline: "none",
      }}
    />
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 8px", fontSize: 12.5, color: "hsl(0 65% 50%)", fontFamily: "Verdana, Geneva, sans-serif" }}>
      {children}
    </p>
  );
}

function CancelBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "hsl(var(--ink-soft))", fontFamily: "Verdana, Geneva, sans-serif", marginTop: 4, width: "100%" }}
    >
      {children}
    </button>
  );
}
