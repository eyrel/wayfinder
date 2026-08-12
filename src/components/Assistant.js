"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "@/components/Icon";
import { byCode } from "@/lib/languages";

const SUGGESTIONS = [
  { label: "Will I make it?", text: "Will I make my connection?" },
  { label: "A quieter route", text: "Is there a quieter route?" },
  { label: "Where is my bag?", text: "Where do I collect my bag?" },
];

export default function Assistant({ context, compact = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinking]);

  async function send(text) {
    const value = (text ?? input).trim();
    if (!value || thinking) return;

    setMessages((m) => [...m, { role: "user", text: value }]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", text: value }],
          context,
        }),
      });

      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.text ?? "Sorry — try again." }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I couldn't reach the terminal data just now. Try again in a moment." },
      ]);
    } finally {
      setThinking(false);
    }
  }

  const fontSize = compact ? "var(--text-sm)" : "var(--text-base)";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
      <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span
            style={{
              width: 26, height: 26, borderRadius: "var(--radius-sm)",
              background: "var(--secondary-100)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="compass" size={14} stroke="var(--secondary-700)" strokeWidth={2} />
          </span>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>
            Wayfinder assistant
          </span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
            answering in {byCode(context.locale).name}
          </span>
        </div>

        {messages.length === 0 && (
          <p style={{
            margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)",
            color: "var(--text-secondary)",
          }}>
            Ask about your connection, your bag, or anything in the terminal. I check live
            data before answering — I don&apos;t guess at walking times.
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <span
              style={
                m.role === "user"
                  ? {
                      background: "var(--accent-primary)", color: "var(--text-on-accent)",
                      fontSize, lineHeight: "var(--leading-normal)",
                      padding: "9px 13px", borderRadius: "14px 14px 4px 14px", maxWidth: "86%",
                    }
                  : {
                      background: "var(--surface-sunken)", color: "var(--text-primary)",
                      fontSize, lineHeight: "var(--leading-relaxed)",
                      padding: "9px 13px", borderRadius: "14px 14px 14px 4px", maxWidth: "86%",
                    }
              }
            >
              {m.text}
            </span>
          </div>
        ))}

        {thinking && (
          <div style={{ fontSize: "var(--text-xs)", fontStyle: "italic", color: "var(--text-tertiary)" }}>
            Checking live terminal data…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div
        style={{
          marginTop: "auto",
          padding: "var(--space-4) var(--space-5)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex", flexDirection: "column", gap: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => send(s.text)}
              style={{
                background: "var(--white)", border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-full)", padding: "7px 13px",
                fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)",
                color: "var(--text-secondary)", cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask anything, in any language…"
            aria-label="Ask the Wayfinder assistant"
            disabled={thinking}
            style={{
              flex: 1, minWidth: 0,
              border: "1.5px solid var(--border-strong)",
              borderRadius: "var(--radius-full)",
              padding: "10px 16px",
              fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)",
              color: "var(--text-primary)", background: "var(--white)", outline: "none",
            }}
          />
          <button
            onClick={() => send()}
            disabled={thinking}
            aria-label="Send"
            style={{
              width: 38, height: 38, flex: "none", borderRadius: "50%", border: "none",
              background: "var(--accent-primary)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: thinking ? 0.5 : 1,
            }}
          >
            <Icon name="arrowRight" size={15} stroke="var(--white)" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
