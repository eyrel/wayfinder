"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Icon from "@/components/Icon";
import LookupEntry from "@/components/screens/LookupEntry";
import LookupResult from "@/components/screens/LookupResult";
import RouteScreen from "@/components/screens/RouteScreen";
import { findRoute } from "@/lib/solver";
import { nodes } from "@/lib/changi";
import { LANGUAGES, RTL_CODES, detectLanguage, byCode } from "@/lib/languages";

const NAV = [
  { key: "lookup", label: "Home",            icon: "home" },
  { key: "route",  label: "Route to gate",   icon: "pin" },
  { key: "flight", label: "Flight enquiry",  icon: "plane" },
];

const nodeById = new Map(nodes.map((n) => [n.id, n]));

export default function Home() {
  const [screen, setScreen] = useState("lookup");
  const [lookupStep, setLookupStep] = useState("entry");
  const [flightCode, setFlightCode] = useState("");
  const [lookupError, setLookupError] = useState(null);

  const [flight, setFlight] = useState(null);
  const [onward, setOnward] = useState(null);
  const [tab, setTab] = useState("connect");

  const [pace, setPace] = useState("normal");
  const [currentId, setCurrentId] = useState("T1-C21");

  const [locale, setLocale] = useState("en");
  const [detected, setDetected] = useState(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Detect browser language once. Only offer the switch if it isn't English —
  // navigator.language reflects the DEVICE, not necessarily the passenger, so
  // this is an offer, never an automatic switch.
  useEffect(() => {
    const guess = detectLanguage(navigator.language);
    if (guess.code !== "en") setDetected(guess);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_CODES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  // Poll the onward flight so a gate change surfaces without a reload.
  useEffect(() => {
    if (!onward?.flightNumber) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/flights?flight=${onward.flightNumber}`);
      if (res.ok) setOnward(await res.json());
    }, 15000);
    return () => clearInterval(id);
  }, [onward?.flightNumber]);

  const destination = useMemo(() => {
    const nodeId = onward?.gateNodeId;
    return nodeId ? { nodeId, label: nodeById.get(nodeId)?.label ?? onward.gate } : null;
  }, [onward?.gateNodeId, onward?.gate]);

  // The solver is pure JS with no server dependency, so it runs right here.
  // Pace changes are instant — no network round trip.
  const connectionRoute = useMemo(
    () => (destination ? findRoute(currentId, destination.nodeId, pace) : { found: false, steps: [], path: [], totalSeconds: 0, totalMetres: 0 }),
    [currentId, destination, pace]
  );

  const beltRoute = useMemo(
    () => (flight?.beltNodeId ? findRoute(currentId, flight.beltNodeId, pace) : { found: false, steps: [], path: [], totalSeconds: 0, totalMetres: 0 }),
    [currentId, flight?.beltNodeId, pace]
  );

  const handleKey = useCallback((k) => {
    setLookupError(null);
    setFlightCode((prev) =>
      k === "⌫" ? prev.slice(0, -1) : prev.length < 6 ? prev + k : prev
    );
  }, []);

  const runLookup = useCallback(async (code) => {
    const query = (code ?? flightCode).trim().toUpperCase();
    if (!query) return;

    const res = await fetch(`/api/flights?flight=${encodeURIComponent(query)}`);
    if (!res.ok) {
      setLookupError("We couldn't find that flight. Check the number and try again.");
      return;
    }

    const data = await res.json();
    setFlight(data);
    setFlightCode(query);
    setLookupError(null);

    // Derive the passenger's position from where the inbound flight parked —
    // no GPS, no questions asked. Indoor GPS is useless in a terminal.
    if (data.direction === "arrival" && data.gateNodeId) setCurrentId(data.gateNodeId);

    if (data.onwardFlight) {
      const onwardRes = await fetch(`/api/flights?flight=${data.onwardFlight}`);
      setOnward(onwardRes.ok ? await onwardRes.json() : null);
    } else {
      setOnward(data.direction === "departure" ? data : null);
    }

    setLookupStep("result");
    setScreen("lookup");
  }, [flightCode]);

  const context = {
    currentId,
    pace,
    locale,
    onwardFlight: onward?.flightNumber ?? null,
  };

  const titles = {
    route:  ["Route to gate " + (onward?.gate ?? ""), "Live guidance across the terminals"],
    flight: ["Flight enquiry", "Live Changi departures and arrivals"],
    lookup: lookupStep === "entry"
      ? ["Home", "Enter your flight number to begin"]
      : [flightCode, "Live arrival, belt, connection and gate"],
  };
  const [title, subtitle] = titles[screen] ?? titles.lookup;

  const countdown = onward?.minutesUntilBoardingCloses;
  const bufferMins =
    countdown != null && connectionRoute.found
      ? countdown - Math.round(connectionRoute.totalSeconds / 60)
      : null;

  const countdownTone =
    bufferMins == null ? "neutral" : bufferMins < 0 ? "error" : bufferMins < 15 ? "warning" : "success";

  const TONE_STYLE = {
    neutral: { bg: "var(--surface-sunken)", fg: "var(--text-secondary)", dot: "var(--gray-400)" },
    success: { bg: "var(--status-success-subtle)", fg: "var(--status-success-strong)", dot: "var(--status-success)" },
    warning: { bg: "var(--status-warning-subtle)", fg: "var(--status-warning-strong)", dot: "var(--status-warning)" },
    error:   { bg: "var(--status-error-subtle)", fg: "var(--status-error-strong)", dot: "var(--status-error)" },
  }[countdownTone];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-page)" }}>
      {/* ---------------------------------------------------------- Sidebar */}
      <nav style={{
        width: 232, flex: "none", background: "var(--white)",
        borderRight: "1px solid var(--border-default)",
        display: "flex", flexDirection: "column",
        padding: "var(--space-6) var(--space-4)", gap: "var(--space-8)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "0 var(--space-2)" }}>
          <span style={{
            width: 30, height: 30, borderRadius: "9px", background: "var(--accent-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="compass" size={17} stroke="var(--white)" strokeWidth={2} />
          </span>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: "var(--text-xl)",
            fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)",
          }}>
            Wayfinder
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{
            fontSize: "10px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase", color: "var(--text-tertiary)", padding: "0 var(--space-2) var(--space-2)",
          }}>
            Journey
          </div>
          {NAV.map((item) => {
            const active = screen === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setScreen(item.key);
                  if (item.key === "lookup") setLookupStep(flight ? "result" : "entry");
                  setLangMenuOpen(false);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "11px", textAlign: "left",
                  padding: "10px", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
                  fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)",
                  fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)",
                  background: active ? "var(--accent-primary-subtle)" : "transparent",
                  color: active ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        {onward && (
          <div style={{
            marginTop: "auto", borderTop: "1px solid var(--border-subtle)",
            paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)",
          }}>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Boarding pass linked</div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>
              {onward.flightNumber} · {onward.destination}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
              Gate {onward.gate ?? "TBC"} · {onward.terminal}
            </div>
          </div>
        )}
      </nav>

      {/* ------------------------------------------------------------- Main */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{
          minHeight: 68, flex: "none", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "var(--space-5)",
          padding: "0 var(--space-8)", background: "var(--white)",
          borderBottom: "1px solid var(--border-default)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-4)", minWidth: 0 }}>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)",
              fontWeight: "var(--weight-semibold)", whiteSpace: "nowrap",
            }}>
              {title}
            </span>
            <span style={{
              fontSize: "var(--text-sm)", color: "var(--text-tertiary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {subtitle}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {countdown != null && (
              <div
                aria-live="polite"
                style={{
                  display: "flex", alignItems: "center", gap: "var(--space-2)",
                  background: TONE_STYLE.bg, borderRadius: "var(--radius-full)", padding: "6px 14px",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: TONE_STYLE.dot }} />
                <span style={{
                  fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)",
                  color: TONE_STYLE.fg, fontVariantNumeric: "tabular-nums",
                }}>
                  {countdown} min to boarding
                </span>
              </div>
            )}

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setLangMenuOpen((v) => !v)}
                aria-expanded={langMenuOpen}
                style={{
                  display: "flex", alignItems: "center", gap: "var(--space-2)",
                  background: "var(--white)", border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-full)", padding: "7px 14px",
                  fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-semibold)", color: "var(--text-secondary)", cursor: "pointer",
                }}
              >
                <Icon name="globe" size={16} />
                {byCode(locale).name}
              </button>

              {langMenuOpen && (
                <div style={{
                  position: "absolute", top: 46, right: 0, zIndex: 40, width: 260,
                  background: "var(--white)", border: "1px solid var(--border-default)",
                  borderRadius: "14px", boxShadow: "var(--shadow-lg)", padding: "var(--space-2)",
                  display: "flex", flexDirection: "column", gap: 2,
                }}>
                  <div style={{
                    padding: "var(--space-2) var(--space-3) 6px", fontSize: "var(--text-xs)",
                    fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)",
                    textTransform: "uppercase", color: "var(--text-tertiary)",
                  }}>
                    Reply to me in
                  </div>
                  <div style={{ maxHeight: 300, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLocale(l.code); setLangMenuOpen(false); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          gap: "var(--space-3)", textAlign: "left",
                          background: locale === l.code ? "var(--accent-primary-subtle)" : "transparent",
                          border: "none", borderRadius: "9px", padding: "10px var(--space-3)",
                          fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)",
                          fontWeight: "var(--weight-semibold)",
                          color: locale === l.code ? "var(--accent-primary)" : "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        <span>{l.name}</span>
                        <span style={{ color: "var(--text-tertiary)", fontWeight: "var(--weight-regular)" }}>
                          {l.native}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div style={{
                    borderTop: "1px solid var(--border-subtle)", marginTop: 6,
                    padding: "10px var(--space-3)", fontSize: "var(--text-xs)",
                    lineHeight: "var(--leading-normal)", color: "var(--text-tertiary)",
                  }}>
                    Or just speak — we detect your language from the first sentence.
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflow: "auto", position: "relative" }}>
          {screen === "lookup" && lookupStep === "entry" && (
            <LookupEntry
              flightCode={flightCode}
              onKey={handleKey}
              onSubmit={() => runLookup()}
              onPickRecent={(code) => runLookup(code)}
              error={lookupError}
              detected={detected}
              onAcceptDetect={() => { setLocale(detected.code); setDetected(null); }}
              onDismissDetect={() => setDetected(null)}
            />
          )}

          {screen === "lookup" && lookupStep === "result" && flight && (
            <LookupResult
              flight={flight}
              onward={onward}
              beltRoute={beltRoute}
              connectionRoute={connectionRoute}
              tab={tab}
              onTabChange={setTab}
              onBack={() => { setLookupStep("entry"); setFlightCode(""); }}
              onGuideMe={() => setScreen("route")}
              onStepFree={() => { setPace("stepfree"); setScreen("route"); }}
              currentId={currentId}
            />
          )}

          {screen === "route" && (
            <RouteScreen
              route={connectionRoute}
              pace={pace}
              onPaceChange={setPace}
              currentId={currentId}
              destination={destination}
              originLabel={nodeById.get(currentId)?.label ?? "You"}
              context={context}
              onNodeClick={setCurrentId}
            />
          )}

          {screen === "flight" && (
            <div style={{ padding: "var(--space-8)", maxWidth: 720 }}>
              <LookupEntry
                flightCode={flightCode}
                onKey={handleKey}
                onSubmit={() => runLookup()}
                onPickRecent={(code) => runLookup(code)}
                error={lookupError}
                detected={null}
                onAcceptDetect={() => {}}
                onDismissDetect={() => {}}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
