"use client";

import { Alert, Badge, Button, Card, Tabs, TabItem } from "@/components/ds";
import TerminalMap from "@/components/TerminalMap";
import Icon from "@/components/Icon";
import { routeMeta } from "@/lib/solver";

const STATUS_BADGE = {
  landed: ["success", "LANDED"],
  on_time: ["success", "ON TIME"],
  en_route: ["accent", "IN THE AIR"],
  delayed: ["warning", "DELAYED"],
  gate_change: ["warning", "GATE CHANGED"],
  cancelled: ["error", "CANCELLED"],
  gate_closed: ["error", "GATE CLOSED"],
};

function Stat({ label, value, sub, tone }) {
  return (
    <div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{label}</div>
      <div style={{
        fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)",
        fontVariantNumeric: "tabular-nums", color: tone ?? "var(--text-primary)",
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{sub}</div>}
    </div>
  );
}

function timeOf(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function LookupResult({
  flight, onward, beltRoute, connectionRoute, tab, onTabChange,
  onBack, onGuideMe, onStepFree, currentId,
}) {
  const [badgeVariant, badgeText] = STATUS_BADGE[flight.status] ?? ["neutral", flight.status.toUpperCase()];

  const bufferMins =
    onward && connectionRoute.found && onward.minutesUntilBoardingCloses != null
      ? onward.minutesUntilBoardingCloses - Math.round(connectionRoute.totalSeconds / 60)
      : null;

  const bufferTone =
    bufferMins == null ? undefined
      : bufferMins < 0 ? "var(--status-error-strong)"
      : bufferMins < 15 ? "var(--status-warning-strong)"
      : "var(--status-success-strong)";

  const mapRoute = tab === "belt" ? beltRoute : connectionRoute;
  const mapDestination = tab === "belt" ? flight.beltNodeId : onward?.gateNodeId;

  return (
    <div style={{
      padding: "var(--space-8)", display: "flex", flexDirection: "column",
      gap: "var(--space-5)", maxWidth: 1180,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: "var(--space-2)",
          background: "transparent", border: "none", padding: 0,
          fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)",
          fontWeight: "var(--weight-semibold)", color: "var(--accent-primary)", cursor: "pointer",
        }}>
          <Icon name="arrowLeft" size={15} strokeWidth={2} />
          Different flight
        </button>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
          {flight.flightNumber} · today
        </span>
      </div>

      <Card padding="var(--space-8)">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-5)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <span style={{
              fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
              letterSpacing: "var(--tracking-wide)", textTransform: "uppercase",
              color: "var(--accent-secondary)",
            }}>
              {flight.direction === "arrival" ? "Arriving" : "Departing"}
            </span>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)",
              fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)",
            }}>
              {flight.flightNumber} · {flight.origin ?? "Singapore"} → {flight.destination ?? "Singapore"}
            </div>
            <div style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)" }}>
              {flight.airline}{flight.aircraft ? ` · ${flight.aircraft}` : ""}{flight.seat ? ` · seat ${flight.seat}` : ""}
            </div>
          </div>
          <Badge variant={badgeVariant}>{badgeText}</Badge>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "var(--space-5)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-5)",
        }}>
          <Stat
            label={flight.direction === "arrival" ? "Landed" : "Departs"}
            value={timeOf(flight.actualArrival ?? flight.scheduledArrival ?? flight.scheduledDeparture)}
            sub={flight.status === "landed" ? "on the ground" : null}
          />
          <Stat label="Terminal" value={flight.terminal?.replace("T", "") ?? "—"} sub={flight.gate ? `Gate ${flight.gate}` : null} />
          <Stat label="Baggage belt" value={flight.belt ?? "—"} sub={flight.firstBagsAt ? `first bags ${timeOf(flight.firstBagsAt)}` : null} />
          <Stat
            label="Onward flight"
            value={onward?.flightNumber ?? "—"}
            sub={onward ? `gate ${onward.gate ?? "TBC"}, ${onward.terminal}` : null}
          />
        </div>
      </Card>

      <Tabs active={tab} onChange={onTabChange}>
        <TabItem key="belt" label="Baggage belt" />
        <TabItem key="connect" label="Connecting flight" />
        <TabItem key="boarding" label="Boarding & gate status" />
      </Tabs>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "var(--space-5)", alignItems: "start",
      }}>
        <Card padding="var(--space-6)">
          {tab === "belt" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <span style={{
                  fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                  letterSpacing: "var(--tracking-wide)", textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                }}>
                  To your bag
                </span>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>
                  Belt {flight.belt}, arrivals level, Terminal {flight.terminal?.replace("T", "")}
                </div>
                <div style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)", color: "var(--text-secondary)" }}>
                  {routeMeta(beltRoute)} from your gate, including immigration.
                  {flight.firstBagsAt && ` First bags reach the belt at ${timeOf(flight.firstBagsAt)}.`}
                </div>
              </div>
              <ol style={{
                margin: 0, listStyle: "none", padding: "var(--space-4) 0 0",
                display: "flex", flexDirection: "column", gap: "var(--space-3)",
                borderTop: "1px solid var(--border-subtle)",
              }}>
                {beltRoute.steps.map((s, i) => (
                  <li key={i} style={{ display: "flex", gap: "var(--space-3)", alignItems: "baseline" }}>
                    <span style={{
                      width: 22, height: 22, flex: "none", borderRadius: "50%",
                      background: "var(--surface-sunken)", color: "var(--text-secondary)",
                      fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)" }}>
                      {s.text} <span style={{ color: "var(--text-tertiary)" }}>{Math.max(1, Math.round(s.seconds / 60))} min</span>
                    </span>
                  </li>
                ))}
              </ol>
              <Alert variant="info">
                Automated immigration lanes are open at Pier C — your passport works if you are 6 or older.
              </Alert>
            </>
          )}

          {tab === "connect" && onward && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <span style={{
                  fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                  letterSpacing: "var(--tracking-wide)", textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                }}>
                  Your connection
                </span>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>
                  {onward.flightNumber} to {onward.destination}, gate {onward.gate ?? "TBC"}
                </div>
                <div style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)", color: "var(--text-secondary)" }}>
                  {routeMeta(connectionRoute)}, transfer security included. Your bag is checked through.
                </div>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)",
                borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)",
                padding: "var(--space-4) 0",
              }}>
                <Stat label="Walk time" value={`${Math.round(connectionRoute.totalSeconds / 60)} min`} />
                <Stat label="Boarding closes" value={onward.minutesUntilBoardingCloses != null ? `${onward.minutesUntilBoardingCloses} min` : "—"} />
                <Stat label="Spare time" value={bufferMins != null ? `${bufferMins} min` : "—"} tone={bufferTone} />
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <Button onClick={onGuideMe}>Guide me to {onward.gate ?? "the gate"}</Button>
                <Button variant="secondary" onClick={onStepFree}>Step-free version</Button>
              </div>
            </>
          )}

          {tab === "boarding" && onward && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
                  <span style={{
                    fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                    letterSpacing: "var(--tracking-wide)", textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                  }}>
                    Gate status
                  </span>
                  <Badge variant={onward.status === "cancelled" ? "error" : "success"}>
                    {onward.status === "cancelled" ? "CANCELLED" : "GATE OPEN"}
                  </Badge>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>
                  Gate {onward.gate ?? "TBC"} · boarding closes {timeOf(onward.boardingClosesAt)}
                </div>
                <div style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)", color: "var(--text-secondary)" }}>
                  Departure is {timeOf(onward.scheduledDeparture)}. We will nudge you 25 minutes
                  before your zone, sooner if the queue grows.
                </div>
              </div>
              <Alert variant="warning">
                Gates in Pier B occasionally move within the pier. If {onward.gate} changes,
                this page updates within seconds.
              </Alert>
            </>
          )}
        </Card>

        <div style={{
          background: "var(--white)", border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)",
          padding: "var(--space-4)", height: 520, position: "relative",
        }}>
          <div style={{ position: "absolute", inset: "var(--space-4)" }}>
            <TerminalMap route={mapRoute} currentId={currentId} destinationId={mapDestination} />
          </div>
        </div>
      </div>
    </div>
  );
}
