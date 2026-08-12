// Changi-shaped mock flight data.


import { gateToNodeId } from "@/lib/changi";

const MINUTE = 60 * 1000;
const T0 = Date.now();
const at = (mins) => new Date(T0 + mins * MINUTE).toISOString();

const FLIGHTS = {
  // Inbound — landed 14 min ago at T1 Pier C. Gives the program the passenger's
  // starting position without asking a single question.
  VC418: {
    flightNumber: "VC418",
    airline: "Singapore Airlines",
    direction: "arrival",
    origin: "Hong Kong",
    terminal: "T1",
    gate: "C21",
    belt: "12",
    beltNodeId: "T1-BELT",
    aircraft: "Airbus A350",
    seat: "24K",
    status: "landed",
    scheduledArrival: at(-18),
    actualArrival: at(-14),
    firstBagsAt: at(4),
    onwardFlight: "VC102",
  },

  // The connection. T3 Pier B — a cross-terminal transfer. Headline scenario.
  VC102: {
    flightNumber: "VC102",
    airline: "Japan AIrways",
    direction: "departure",
    destination: "Tokyo Haneda",
    terminal: "T3",
    gate: "B14",
    aircraft: "Boeing 787-10",
    status: "on_time",
    scheduledDeparture: at(58),
    boardingOpensAt: at(28),
    boardingClosesMinutesBefore: 5,
    zone: "3",
  },

  // Comfortable — same terminal. Green countdown state.
  SQ876: {
    flightNumber: "SQ876",
    airline: "Singapore Airlines",
    direction: "departure",
    destination: "Sydney",
    terminal: "T3",
    gate: "C1",
    status: "on_time",
    scheduledDeparture: at(190),
    boardingClosesMinutesBefore: 20,
  },

  // Delayed — estimated diverges from scheduled. The countdown must follow
  // estimated, not scheduled.
  NH842: {
    flightNumber: "NH842",
    airline: "All Nippon Airways",
    direction: "departure",
    destination: "Tokyo Narita",
    terminal: "T3",
    gate: "B20",
    status: "delayed",
    scheduledDeparture: at(45),
    estimatedDeparture: at(103),
    delayMinutes: 58,
    boardingClosesMinutesBefore: 20,
  },

  // Cancelled — never route a passenger to this gate.
  VC116: {
    flightNumber: "VC116",
    airline: "Singapore Airlines",
    direction: "departure",
    destination: "Penang",
    terminal: "T1",
    gate: null,
    status: "cancelled",
    scheduledDeparture: at(80),
    boardingClosesMinutesBefore: 20,
  },
};

// In-memory demo overrides.
const overrides = new Map();

const key = (fn) => String(fn).toUpperCase().replace(/\s+/g, "");

export function applyOverride(flightNumber, patch) {
  const k = key(flightNumber);
  overrides.set(k, { ...(overrides.get(k) ?? {}), ...patch });
}

export function clearOverrides() {
  overrides.clear();
}

export async function getFlight(flightNumber) {
  const k = key(flightNumber);
  const base = FLIGHTS[k];
  if (!base) return null;
  return decorate({ ...base, ...(overrides.get(k) ?? {}) });
}

export async function listFlights(direction) {
  const all = Object.keys(FLIGHTS).map((k) =>
    decorate({ ...FLIGHTS[k], ...(overrides.get(k) ?? {}) })
  );
  return direction ? all.filter((f) => f.direction === direction) : all;
}

function decorate(f) {
  const departure = f.estimatedDeparture ?? f.scheduledDeparture ?? null;
  const arrival = f.actualArrival ?? f.estimatedArrival ?? f.scheduledArrival ?? null;

  let boardingClosesAt = null;
  let secondsUntilBoardingCloses = null;

  if (departure && f.status !== "cancelled") {
    const closes =
      new Date(departure).getTime() - (f.boardingClosesMinutesBefore ?? 20) * MINUTE;
    boardingClosesAt = new Date(closes).toISOString();
    secondsUntilBoardingCloses = Math.round((closes - Date.now()) / 1000);
  }

  return {
    ...f,
    source: "mock",
    boardingClosesAt,
    secondsUntilBoardingCloses,
    minutesUntilBoardingCloses:
      secondsUntilBoardingCloses === null ? null : Math.floor(secondsUntilBoardingCloses / 60),
    gateNodeId: gateToNodeId(f.gate),
    displayTime: departure ?? arrival,
    isActionable: !["cancelled", "gate_closed"].includes(f.status),
  };
}

// Demo control surface. Wire these to hidden buttons or query params.
export const scenarios = {
  // The money shot: gate moves B14 -> B20, a different part of Pier B.
  // Route redraws, countdown buffer shrinks, AI's next answer reflects it.
  gateChange() {
    applyOverride("VC102", { gate: "B20", status: "gate_change" });
  },
  // Squeeze the connection — flips the countdown amber to red.
  tighten() {
    applyOverride("VC102", { scheduledDeparture: at(24), estimatedDeparture: null });
  },
  // Push it back — countdown goes green, route unchanged.
  delay() {
    applyOverride("VC102", { status: "delayed", estimatedDeparture: at(120), delayMinutes: 62 });
  },
  reset() {
    clearOverrides();
  },
};
