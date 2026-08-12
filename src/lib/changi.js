// Terminal graph.
//
// IMPORTANT: x/y are coordinates in the design system's 900x520 map space
// (see components/TerminalMap.js). They position the node on the drawing.
// `metres` on each edge is REAL WALKING DISTANCE and is what the solver uses.
// These are different numbers doing different jobs — never conflate them.

export const MAP_WIDTH = 900;
export const MAP_HEIGHT = 520;

export const nodes = [
  // Terminal 1 (arrival side)
  { id: "T1-C21",    label: "Gate C21",          terminal: "T1", x: 154, y: 313, type: "gate" },
  { id: "T1-C-HALL", label: "Pier C hall",       terminal: "T1", x: 154, y: 262, type: "junction" },
  { id: "T1-IMMIG",  label: "Immigration",       terminal: "T1", x: 196, y: 250, type: "security" },
  { id: "T1-BELT",   label: "Belt 12",           terminal: "T1", x: 112, y: 206, type: "baggage" },
  { id: "T1-ESC",    label: "Escalator",         terminal: "T1", x: 216, y: 290, type: "escalator" },
  { id: "T1-LIFT",   label: "Lift L2",           terminal: "T1", x: 272, y: 206, type: "lift" },
  { id: "T1-TRAIN",  label: "T1 Skytrain",       terminal: "T1", x: 232, y: 262, type: "train" },

  // Terminal 2 (transit through)
  { id: "T2-TRAIN-W", label: "T2 Skytrain west", terminal: "T2", x: 392, y: 250, type: "train" },
  { id: "T2-HALL",    label: "T2 transit hall",  terminal: "T2", x: 460, y: 240, type: "junction" },
  { id: "T2-ESC",     label: "T2 escalator",     terminal: "T2", x: 460, y: 200, type: "escalator" },
  { id: "T2-LIFT",    label: "T2 lift",          terminal: "T2", x: 460, y: 288, type: "lift" },
  { id: "T2-FOOD",    label: "Food hall",        terminal: "T2", x: 440, y: 300, type: "amenity" },
  { id: "T2-TRAIN-E", label: "T2 Skytrain east", terminal: "T2", x: 528, y: 235, type: "train" },

  // Terminal 3 (departure side)
  { id: "T3-TRAIN",  label: "T3 Skytrain",       terminal: "T3", x: 676, y: 235, type: "train" },
  { id: "T3-SEC",    label: "Transfer security", terminal: "T3", x: 676, y: 190, type: "security" },
  { id: "T3-B14",    label: "Gate B14",          terminal: "T3", x: 712, y: 167, type: "gate" },
  { id: "T3-B20",    label: "Gate B20",          terminal: "T3", x: 758, y: 216, type: "gate" },
  { id: "T3-C1",     label: "Gate C1",           terminal: "T3", x: 758, y: 274, type: "gate" },
  { id: "T3-LOUNGE", label: "Lounge",            terminal: "T3", x: 758, y: 321, type: "amenity" },
];

export const edges = [
  // T1
  { from: "T1-C21",    to: "T1-C-HALL",  metres: 110, type: "corridor" },
  { from: "T1-C-HALL", to: "T1-IMMIG",   metres: 70,  type: "corridor" },
  { from: "T1-IMMIG",  to: "T1-BELT",    metres: 90,  type: "corridor" },
  { from: "T1-C-HALL", to: "T1-ESC",     metres: 60,  type: "escalator" },
  { from: "T1-C-HALL", to: "T1-LIFT",    metres: 90,  type: "lift" },
  { from: "T1-ESC",    to: "T1-TRAIN",   metres: 40,  type: "corridor" },
  { from: "T1-LIFT",   to: "T1-TRAIN",   metres: 70,  type: "corridor" },

  // Skytrain. The Changi Skytrain is a single line T1-T2-T3, so a passenger
  // going T1 -> T3 rides through without changing. The through edge models
  // that; the per-leg edges serve passengers whose destination IS T2.
  { from: "T1-TRAIN",  to: "T3-TRAIN",   metres: 2050, type: "train" },
  { from: "T1-TRAIN",  to: "T2-TRAIN-W", metres: 1100, type: "train" },

  // T2
  { from: "T2-TRAIN-W", to: "T2-HALL",    metres: 90, type: "corridor" },
  { from: "T2-HALL",    to: "T2-ESC",     metres: 50, type: "escalator" },
  { from: "T2-HALL",    to: "T2-LIFT",    metres: 65, type: "lift" },
  { from: "T2-HALL",    to: "T2-FOOD",    metres: 55, type: "corridor" },
  { from: "T2-ESC",     to: "T2-TRAIN-E", metres: 80, type: "corridor" },
  { from: "T2-LIFT",    to: "T2-TRAIN-E", metres: 95, type: "corridor" },

  // Skytrain T2 -> T3
  { from: "T2-TRAIN-E", to: "T3-TRAIN",   metres: 950, type: "train" },

  // T3
  { from: "T3-TRAIN", to: "T3-SEC",    metres: 80,  type: "corridor" },
  { from: "T3-SEC",   to: "T3-B14",    metres: 60,  type: "corridor" },
  { from: "T3-SEC",   to: "T3-B20",    metres: 130, type: "corridor" },
  { from: "T3-SEC",   to: "T3-C1",     metres: 210, type: "corridor" },
  { from: "T3-C1",    to: "T3-LOUNGE", metres: 70,  type: "corridor" },
];

// Gate label -> node id. Real Changi has far more gates than the graph has
// nodes, so unknown gates fall back to their pier.
const GATE_ALIASES = {
  B14: "T3-B14", B15: "T3-B14", B12: "T3-B14", B10: "T3-B14",
  B20: "T3-B20", B18: "T3-B20", B16: "T3-B20",
  C1: "T3-C1", C4: "T3-C1", C8: "T3-C1",
  C21: "T1-C21", C19: "T1-C21", C23: "T1-C21",
};

export function gateToNodeId(label) {
  if (!label) return null;
  const clean = String(label).toUpperCase().replace(/^GATE\s*/, "").trim();
  return GATE_ALIASES[clean] ?? null;
}
