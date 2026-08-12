"use client";

import { Alert, Button, Card } from "@/components/ds";
import Icon from "@/components/Icon";

const KEYPAD = ["1","2","3","4","5","6","7","8","9","VC","0","⌫"];

const RECENT = [
  { label: "VC418 · from Hong Kong", code: "VC418" },
  { label: "VC102 · to Tokyo",       code: "VC102" },
  { label: "SQ876 · to Sydney",      code: "SQ876" },
];

export default function LookupEntry({
  flightCode, onKey, onSubmit, onPickRecent,
  error, detected, onAcceptDetect, onDismissDetect,
}) {
  return (
    <div style={{
      maxWidth: 760, margin: "0 auto",
      padding: "var(--space-10) var(--space-8) var(--space-16)",
      display: "flex", flexDirection: "column", gap: "var(--space-5)",
    }}>
      {detected && (
        <Alert variant="info" onDismiss={onDismissDetect}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-5)", flexWrap: "wrap" }}>
            <span>Your device is set to {detected.native}. Switch Wayfinder to {detected.name}?</span>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button size="sm" onClick={onAcceptDetect}>{detected.native}</Button>
              <Button size="sm" variant="ghost" onClick={onDismissDetect}>Keep English</Button>
            </div>
          </div>
        </Alert>
      )}

      <Card padding="var(--space-8)">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <span style={{
            fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
            letterSpacing: "var(--tracking-wide)", textTransform: "uppercase",
            color: "var(--accent-secondary)",
          }}>
            Start here
          </span>
          <h1 style={{
            margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)",
            fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)",
            lineHeight: "var(--leading-tight)",
          }}>
            What is your flight number?
          </h1>
          <p style={{
            margin: 0, fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)",
            color: "var(--text-secondary)", maxWidth: "56ch",
          }}>
            It is printed on your boarding pass, next to the airline name. We use it to find
            your landing time, terminal, baggage belt and gate.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>
            Flight number
          </span>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <div style={{
              flex: 1, minWidth: 0,
              border: `1.5px solid ${error ? "var(--status-error)" : "var(--accent-primary)"}`,
              borderRadius: "var(--radius-md)", padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)",
            }}>
              <span style={{
                fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)",
                letterSpacing: "var(--tracking-wide)", fontVariantNumeric: "tabular-nums",
                minHeight: "1.2em",
              }}>
                {flightCode || <span style={{ color: "var(--text-disabled)" }}>VC102</span>}
              </span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                Today
              </span>
            </div>
            <Button size="lg" onClick={onSubmit} disabled={flightCode.length < 3}>
              Find my flight
            </Button>
          </div>
          <span style={{ fontSize: "var(--text-sm)", color: error ? "var(--status-error-strong)" : "var(--text-tertiary)" }}>
            {error || "Two letters and up to four digits, for example VC102"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-2)" }}>
          {KEYPAD.map((k) => (
            <button
              key={k}
              onClick={() => onKey(k)}
              aria-label={k === "⌫" ? "Delete" : k}
              style={{
                background: "var(--white)", border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)", padding: "14px 0",
                fontFamily: "var(--font-sans)", fontSize: "var(--text-lg)",
                fontWeight: "var(--weight-semibold)", color: "var(--text-primary)", cursor: "pointer",
              }}
            >
              {k}
            </button>
          ))}
        </div>

        <div style={{
          borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-5)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Or pick up where you left off
          </span>
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
            {RECENT.map((r) => (
              <button
                key={r.code}
                onClick={() => onPickRecent(r.code)}
                style={{
                  background: "var(--white)", border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-full)", padding: "10px 16px",
                  fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)", cursor: "pointer",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div style={{
        display: "flex", alignItems: "center", gap: "var(--space-4)",
        background: "var(--white)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)", padding: "18px 22px",
      }}>
        <Icon name="mic" size={20} stroke="var(--accent-primary)" />
        <span style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)" }}>
          You can also say your flight number out loud, in any language.
        </span>
      </div>
    </div>
  );
}
