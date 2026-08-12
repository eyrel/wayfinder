import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { findRoute } from "@/lib/solver";
import { getFlight } from "@/lib/flights";
import { gateToNodeId, nodes } from "@/lib/changi";
import { byCode } from "@/lib/languages";

export const maxDuration = 30;

// The tools. This is the whole point of the architecture: the model never
// calculates a walking time or recalls a gate number. It calls these, and
// these run real graph maths against real data.
function buildTools(context) {
  return {
    getRoute: tool({
      description:
        "Calculate the walking route and time between two points in the terminal. " +
        "Use this whenever the passenger asks how to get somewhere, how long something " +
        "takes, or whether they will make their connection.",
      inputSchema: z.object({
        toNodeId: z.string().describe("Destination node id, e.g. 'T3-B14', 'T1-BELT'."),
        fromNodeId: z
          .string()
          .optional()
          .describe("Start point. Omit to use the passenger's current position."),
      }),
      execute: async ({ toNodeId, fromNodeId }) => {
        const from = fromNodeId || context.currentId;
        if (!from) {
          return { error: "Position unknown. Ask the passenger which gate or pier they are near." };
        }

        const route = findRoute(from, toNodeId, context.pace);
        if (!route.found) {
          return {
            error: `No ${context.pace === "stepfree" ? "step-free " : ""}route from ${from} to ${toNodeId}.`,
          };
        }

        return {
          minutes: Math.max(1, Math.round(route.totalSeconds / 60)),
          walkingMetres: route.totalMetres,
          usedSkytrain: route.usedTrain,
          steps: route.steps.map((s) => s.text),
        };
      },
    }),

    getFlightStatus: tool({
      description:
        "Look up a flight's current gate, terminal, baggage belt, status and boarding " +
        "deadline. Call this before answering any question about a specific flight.",
      inputSchema: z.object({
        flightNumber: z.string().describe("Flight number, e.g. 'VC102'."),
      }),
      execute: async ({ flightNumber }) => {
        const flight = await getFlight(flightNumber);
        if (!flight) return { error: `Flight ${flightNumber} not found.` };

        return {
          flightNumber: flight.flightNumber,
          terminal: flight.terminal,
          gate: flight.gate,
          gateNodeId: flight.gateNodeId,
          belt: flight.belt,
          beltNodeId: flight.beltNodeId,
          status: flight.status,
          minutesUntilBoardingCloses: flight.minutesUntilBoardingCloses,
        };
      },
    }),

    findGate: tool({
      description: "Convert a gate label the passenger says, like 'B14', into a node id for getRoute.",
      inputSchema: z.object({
        gateLabel: z.string().describe("Gate as spoken, e.g. 'B14'."),
      }),
      execute: async ({ gateLabel }) => {
        const nodeId = gateToNodeId(gateLabel);
        return nodeId ? { nodeId } : { error: `Unrecognised gate '${gateLabel}'.` };
      },
    }),
  };
}

export async function POST(req) {
  const { messages = [], context = {} } = await req.json();

  const pace = context.pace || "normal";
  const currentId = context.currentId || null;
  const language = byCode(context.locale || "en").name;
  const here = nodes.find((n) => n.id === currentId);

  const system = `
You are Wayfinder, a transit assistant at Singapore Changi Airport. The passenger is
connecting between flights and may be stressed or short on time.

THIS PASSENGER:
- Current position: ${currentId ?? "unknown"}${here ? ` (${here.label}, ${here.terminal})` : ""}
- Walking pace setting: ${pace}
- Onward flight: ${context.onwardFlight ?? "unknown"}
- Reply in this language: ${language}

RULES:
1. Never estimate walking times or distances yourself. Always call getRoute.
2. Never state a gate, terminal or belt from memory. Always call getFlightStatus first.
3. If their position is unknown, ask which gate or pier they are near before routing.
4. Answer in two or three short sentences. They are walking and reading on a phone.
5. Lead with the answer, then the reason: "Yes - 14 minutes to walk, 32 until boarding closes."
6. If a connection is not achievable, say so plainly and send them to the airline transfer desk.
   Do not soften it into ambiguity.
7. If a flight is cancelled, never route them to its gate. Send them to the transfer counter.
8. Reply in the passenger's language, but keep gate codes, terminal names, flight numbers
   and "Skytrain" in their original form.
9. If asked about anything outside airport navigation, say you cannot help with that and
   offer to get them to their gate.
`.trim();

  const conversation = messages.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.text,
  }));

  try {
    // The agent loop (calling tools, feeding results back, calling again) is
    // handled by the AI SDK itself. stepCountIs(5) caps tool rounds per
    // message — without a stop condition a confused model can loop
    // indefinitely and run up the bill on one question.
    const result = await generateText({
      model: google("gemini-flash-latest"),
      system,
      messages: conversation,
      tools: buildTools({ currentId, pace }),
      stopWhen: stepCountIs(5),
    });

    const text =
      result.text.trim() ||
      "I'm having trouble working that out. Try asking a simpler question, or check the route steps on screen.";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("chat error:", err);
    return NextResponse.json(
      { text: "I couldn't reach the terminal data just now. The route on screen is still accurate." },
      { status: 200 }
    );
  }
}
