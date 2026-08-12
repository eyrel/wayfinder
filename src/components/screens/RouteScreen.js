"use client";

import TerminalMap from "@/components/TerminalMap";
import Assistant from "@/components/Assistant";
import { Button } from "@/components/ds";
import { routeMeta } from "@/lib/solver";

const PACES = [
  { value: "rushing",  label: "Rushing" },
  { value: "normal",   label: "Normal" },
  { value: "stepfree", label: "Step-free" },
];

function paceStyle(active) {
  return {
    flex: 1,
    border: `1px solid ${active ? "var(--primary-200)" : "var(--border-default)"}`,
    background: active ? "var(--accent-primary-subtle)" : "var(--white)",
    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
    borderRadius: "var(--radius-full)",
    padding: "8px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--weight-semibold)",
    cursor: "pointer",
  };
}

export default function RouteScreen({
  route, pace, onPaceChange, currentId, destination, originLabel, context, onNodeClick,
}) {
  return (
    <div style={{ height: "calc(100vh - 68px)", minHeight: 640, display: "flex" }}>
      <div style={{ position: "relative", flex: 1, minWidth: 340, background: "var(--gray-100)" }}>
        <div style={{ position: "absolute", inset: "var(--space-5)" }}>
          <TerminalMap
            route={route}
            currentId={currentId}
            destinationId={destination?.nodeId}
            onNodeClick={onNodeClick}
          />
        </div>
      </div>

      <aside style={{
        width: "min(440px, 40%)", minWidth: 320, flex: "none",
        background: "var(--white)", borderLeft: "1px solid var(--border-default)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "var(--space-5)", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", flexDirection: "column", gap: "var(--space-2)",
        }}>
          <span style={{
            fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
            letterSpacing: "var(--tracking-wide)", textTransform: "uppercase",
            color: "var(--accent-secondary)",
          }}>
            Guided route
          </span>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)",
            fontWeight: "var(--weight-semibold)",
          }}>
            {originLabel} → {destination?.label ?? "your gate"}
          </div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            {routeMeta(route)}
          </div>
          <div role="radiogroup" aria-label="Walking pace" style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            {PACES.map((p) => (
              <button
                key={p.value}
                role="radio"
                aria-checked={pace === p.value}
                onClick={() => onPaceChange(p.value)}
                style={paceStyle(pace === p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <ol style={{
            margin: 0, listStyle: "none",
            padding: "var(--space-5)",
            display: "flex", flexDirection: "column", gap: "var(--space-4)",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            {route.found ? route.steps.map((step, i) => (
              <li key={i} style={{ display: "flex", gap: "var(--space-3)" }}>
                <span style={{
                  width: 22, height: 22, flex: "none", borderRadius: "50%",
                  fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i === 0 ? "var(--accent-secondary)" : "var(--surface-sunken)",
                  color: i === 0 ? "var(--white)" : "var(--text-secondary)",
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
                  {step.text}{" "}
                  <span style={{ color: "var(--text-tertiary)" }}>
                    {Math.max(1, Math.round(step.seconds / 60))} min
                  </span>
                </span>
              </li>
            )) : (
              <li style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                No step-free route is available to that gate. Ask staff at the transfer desk.
              </li>
            )}
          </ol>

          {pace === "stepfree" && (
            <div style={{
              padding: "18px var(--space-5)", display: "flex", flexDirection: "column",
              gap: "var(--space-3)", borderBottom: "1px solid var(--border-subtle)",
              background: "var(--accent-primary-subtle)",
            }}>
              <span style={{
                fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                letterSpacing: "var(--tracking-wide)", textTransform: "uppercase",
                color: "var(--accent-primary)",
              }}>
                Accessibility
              </span>
              <div style={{
                fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)",
                color: "var(--primary-800)",
              }}>
                This route avoids escalators and stairs entirely, and uses a slower walking
                pace. Lifts on the route were reported working at last check.
              </div>
              <Button size="sm" variant="primary">Ask staff to meet me</Button>
            </div>
          )}

          <Assistant context={context} compact />
        </div>
      </aside>
    </div>
  );
}
