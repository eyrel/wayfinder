"use client";

import { nodes, MAP_WIDTH, MAP_HEIGHT } from "@/lib/changi";

const NODE_FILL = {
  gate: "var(--accent-secondary)",
  security: "var(--status-warning)",
  train: "var(--accent-primary)",
  baggage: "var(--secondary-600)",
  amenity: "var(--secondary-400)",
  escalator: "var(--gray-400)",
  lift: "var(--gray-400)",
  junction: "var(--gray-300)",
};

export default function TerminalMap({
  route,
  currentId,
  destinationId,
  showAmenities = false,
  onNodeClick,
}) {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Turn the solver's path into a polyline through the node coordinates.
  const routePoints = (route?.path ?? [])
    .map((id) => byId.get(id))
    .filter(Boolean);

  // Train legs render dashed, walking legs solid — so draw per-segment.
  const segments = [];
  if (route?.found) {
    for (const step of route.steps) {
      const a = byId.get(step.from);
      const b = byId.get(step.to);
      if (a && b) segments.push({ a, b, type: step.type });
    }
  }

  const current = currentId ? byId.get(currentId) : null;
  const destination = destinationId ? byId.get(destinationId) : null;

  const routeLabel = route?.found
    ? `Route in ${route.steps.length} steps, about ${Math.round(route.totalSeconds / 60)} minutes`
    : "Changi terminal plan";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "var(--gray-100)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
        role="img"
        aria-label={routeLabel}
      >
        <defs>
          <pattern id="vcgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="var(--border-default)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#vcgrid)" />

        {/* --- Skytrain guideway (static chrome) --- */}
        <g stroke="var(--gray-300)" strokeWidth="6" strokeDasharray="2 12" strokeLinecap="round" fill="none">
          <path d="M232 250H392" />
          <path d="M528 250H676" />
        </g>
        <text x="312" y="238" textAnchor="middle" fontFamily="Sora" fontSize="13" fill="var(--text-tertiary)">Skytrain</text>
        <text x="602" y="238" textAnchor="middle" fontFamily="Sora" fontSize="13" fill="var(--text-tertiary)">Skytrain</text>

        {/* --- Terminal buildings --- */}
        <g fill="var(--white)" stroke="var(--gray-300)" strokeWidth="2">
          <rect x="76"  y="150" width="156" height="200" rx="16" />
          <rect x="392" y="150" width="136" height="200" rx="16" />
          <rect x="676" y="120" width="164" height="260" rx="16" />
          <rect x="392" y="392" width="136" height="88"  rx="16" />
        </g>

        {/* --- Pier blocks --- */}
        <g fill="var(--gray-100)" stroke="var(--gray-200)" strokeWidth="2">
          <rect x="96"  y="172" width="116" height="34" rx="10" />
          <rect x="96"  y="216" width="116" height="34" rx="10" />
          <rect x="96"  y="296" width="116" height="34" rx="10" />
          <rect x="700" y="150" width="116" height="34" rx="10" />
          <rect x="700" y="194" width="116" height="34" rx="10" />
          <rect x="700" y="252" width="116" height="34" rx="10" />
          <rect x="700" y="304" width="116" height="34" rx="10" />
        </g>

        <g fontFamily="Sora" fontSize="12" fill="var(--text-tertiary)">
          <text x="154" y="194" textAnchor="middle">Pier A</text>
          <text x="154" y="238" textAnchor="middle">Pier B</text>
          <text x="154" y="318" textAnchor="middle">Pier C</text>
          <text x="758" y="172" textAnchor="middle">B10–B14</text>
          <text x="758" y="216" textAnchor="middle">B15–B20</text>
          <text x="758" y="274" textAnchor="middle">C1–C8</text>
          <text x="758" y="326" textAnchor="middle">Retail</text>
        </g>

        <g fontFamily="Spectral" fontSize="17" fill="var(--text-secondary)">
          <text x="86"  y="140">Terminal 1</text>
          <text x="392" y="140">Terminal 2</text>
          <text x="676" y="110">Terminal 3</text>
          <text x="392" y="382">Terminal 4</text>
        </g>

        <circle cx="304" cy="330" r="34" fill="var(--white)" stroke="var(--gray-300)" strokeWidth="2" />
        <text x="304" y="335" textAnchor="middle" fontFamily="Spectral" fontSize="13" fill="var(--text-tertiary)">Jewel</text>

        {/* --- Amenities overlay --- */}
        {showAmenities && (
          <g>
            {nodes.filter((n) => n.type === "amenity").map((n) => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r="13" fill="var(--secondary-100)" stroke="var(--accent-secondary)" strokeWidth="2" />
                <text x={n.x} y={n.y + 34} textAnchor="middle" fontFamily="Sora" fontSize="12" fill="var(--text-secondary)">
                  {n.label}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* --- THE ROUTE: generated from the solver, not hand-drawn --- */}
        {segments.map((seg, i) => (
          <line
            key={i}
            x1={seg.a.x} y1={seg.a.y}
            x2={seg.b.x} y2={seg.b.y}
            stroke={route.usedLift ? "var(--accent-primary)" : "var(--accent-secondary)"}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={seg.type === "train" ? "14 10" : undefined}
          />
        ))}

        {/* Label the lift when the step-free route uses one */}
        {route?.found && route.usedLift && routePoints
          .filter((n) => n.type === "lift")
          .map((n) => (
            <text key={n.id} x={n.x} y={n.y - 16} textAnchor="middle"
                  fontFamily="Sora" fontSize="12" fill="var(--accent-primary)">
              {n.label}
            </text>
          ))}

        {/* Interactive node hit targets */}
        {nodes.map((n) => {
          const onRoute = route?.path?.includes(n.id);
          if (!onRoute && n.type === "junction") return null;

          return (
            <g
              key={n.id}
              onClick={() => onNodeClick?.(n.id)}
              style={{ cursor: onNodeClick ? "pointer" : "default" }}
            >
              <circle cx={n.x} cy={n.y} r="14" fill="transparent" />
              {onRoute && (
                <circle cx={n.x} cy={n.y} r="5"
                        fill={NODE_FILL[n.type] ?? "var(--gray-400)"}
                        stroke="var(--white)" strokeWidth="2" />
              )}
            </g>
          );
        })}

        {/* You are here */}
        {current && (
          <g>
            <circle cx={current.x} cy={current.y} r="18" fill="var(--primary-100)"
                    style={{ transformOrigin: `${current.x}px ${current.y}px`, animation: "vcpulse 2.4s ease-out infinite" }} />
            <circle cx={current.x} cy={current.y} r="9" fill="var(--accent-primary)" stroke="var(--white)" strokeWidth="3" />
            <text x={current.x} y={current.y + 34} textAnchor="middle" fontFamily="Sora"
                  fontSize="13" fontWeight="500" fill="var(--accent-primary)">
              You
            </text>
          </g>
        )}

        {/* Destination */}
        {destination && destination.id !== currentId && (
          <g>
            <circle cx={destination.x} cy={destination.y} r="11" fill="var(--accent-secondary)" stroke="var(--white)" strokeWidth="3" />
            <text x={destination.x + 30} y={destination.y - 20} textAnchor="middle" fontFamily="Sora"
                  fontSize="13" fontWeight="500" fill="var(--secondary-700)">
              {destination.label}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
