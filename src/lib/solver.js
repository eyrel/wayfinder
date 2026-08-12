import { nodes, edges } from "@/lib/changi";

// Walking speed in metres per second, per pace profile.
const BASE_SPEED = { rushing: 1.6, normal: 1.2, stepfree: 0.7 };

// Multiplier applied to base speed for each edge type.
const EDGE_FACTOR = {
  corridor: 1.0,
  travelator: 1.8,   // you walk and it moves
  escalator: 1.4,
  lift: 0.8,         // the car itself is fine; the wait is the real cost
  train: 12.0,       // Skytrain, roughly 43 km/h
};

// Fixed seconds for passing through a node of this type, regardless of distance.
const FIXED_DELAY = {
  security: 180,   // transfer security queue
  train: 120,      // average Skytrain platform wait
  lift: 45,        // average lift wait
};

const BLOCKED_FOR_STEPFREE = ["escalator", "stairs"];

const nodeById = new Map(nodes.map((n) => [n.id, n]));

function buildAdjacency(pace, congestion) {
  const adj = new Map(nodes.map((n) => [n.id, []]));

  for (const edge of edges) {
    if (pace === "stepfree" && BLOCKED_FOR_STEPFREE.includes(edge.type)) continue;

    const speed = BASE_SPEED[pace] * (EDGE_FACTOR[edge.type] ?? 1.0);
    const travel = edge.metres / speed;

    const delayTo = (FIXED_DELAY[nodeById.get(edge.to)?.type] ?? 0) * (congestion[edge.to] ?? 1);
    const delayFrom = (FIXED_DELAY[nodeById.get(edge.from)?.type] ?? 0) * (congestion[edge.from] ?? 1);

    adj.get(edge.from).push({ to: edge.to, seconds: travel + delayTo, edge });
    adj.get(edge.to).push({ to: edge.from, seconds: travel + delayFrom, edge });
  }

  return adj;
}

const EMPTY = { found: false, totalSeconds: 0, totalMetres: 0, steps: [], path: [] };

export function findRoute(fromId, toId, pace = "normal", congestion = {}) {
  if (!nodeById.has(fromId) || !nodeById.has(toId)) return EMPTY;
  if (fromId === toId) {
    return { found: true, totalSeconds: 0, totalMetres: 0, steps: [], path: [fromId] };
  }

  const adj = buildAdjacency(pace, congestion);

  // --- Dijkstra ---
  const cost = new Map([[fromId, 0]]);
  const cameFrom = new Map();
  const done = new Set();

  while (true) {
    let current = null;
    let currentCost = Infinity;
    for (const [id, c] of cost) {
      if (!done.has(id) && c < currentCost) { current = id; currentCost = c; }
    }
    if (current === null || current === toId) break;
    done.add(current);

    for (const next of adj.get(current)) {
      if (done.has(next.to)) continue;
      const candidate = currentCost + next.seconds;
      if (candidate < (cost.get(next.to) ?? Infinity)) {
        cost.set(next.to, candidate);
        cameFrom.set(next.to, { id: current, edge: next.edge, seconds: next.seconds });
      }
    }
  }

  if (!cost.has(toId)) return EMPTY;

  // Rebuild the path backwards
  const steps = [];
  const path = [];
  let cursor = toId;

  while (cursor !== fromId) {
    const prev = cameFrom.get(cursor);
    if (!prev) return EMPTY;

    const a = nodeById.get(prev.id);
    const b = nodeById.get(cursor);

    steps.unshift({
      from: prev.id,
      to: cursor,
      fromLabel: a.label,
      toLabel: b.label,
      metres: prev.edge.metres,
      seconds: Math.round(prev.seconds),
      type: prev.edge.type,
      text: describe(a, b, prev.edge),
    });

    path.unshift(cursor);
    cursor = prev.id;
  }
  path.unshift(fromId);

  return {
    found: true,
    totalSeconds: Math.round(cost.get(toId)),
    // Walking distance only. A 2 km Skytrain ride is not a 2 km walk, and
    // quoting it as one makes every route look impossible.
    totalMetres: steps.reduce((sum, s) => s.type === "train" ? sum : sum + s.metres, 0),
    trainMetres: steps.reduce((sum, s) => s.type === "train" ? sum + s.metres : sum, 0),
    steps,
    path,
    usedTrain: steps.some((s) => s.type === "train"),
    usedLift: steps.some((s) => s.type === "lift"),
  };
}

function describe(from, to, edge) {
  switch (edge.type) {
    case "train":      return `Skytrain to ${to.label}, ride two stops`;
    case "escalator":  return `Escalator down toward ${to.label}`;
    case "lift":       return `${from.label === "Pier C hall" ? "Lift" : to.label} — level access the whole way`;
    case "travelator": return `Follow the moving walkway to ${to.label}`;
    default:           return `Walk ${edge.metres} m to ${to.label}`;
  }
}

// Human summary line: "11 min · 640 m · Skytrain from platform 2"
export function routeMeta(route) {
  if (!route.found) return "No route available";
  const mins = Math.max(1, Math.round(route.totalSeconds / 60));
  const via = route.usedLift ? "lifts only, no stairs"
    : route.usedTrain ? "Skytrain from platform 2"
    : "on foot";
  return `${mins} min · ${route.totalMetres} m · ${via}`;
}

export function getNodes() { return nodes; }
export function getEdges() { return edges; }
