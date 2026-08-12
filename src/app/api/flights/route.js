import { NextResponse } from "next/server";
import { getFlight, scenarios } from "@/lib/flights";

export async function GET(req) {
  const params = req.nextUrl.searchParams;

  // Demo controls: /api/flights?flight=VC102&scenario=gateChange
  const scenario = params.get("scenario");
  if (scenario && scenarios[scenario]) scenarios[scenario]();

  const flightNumber = params.get("flight");
  if (!flightNumber) {
    return NextResponse.json({ error: "flight parameter required" }, { status: 400 });
  }

  const flight = await getFlight(flightNumber);
  if (!flight) {
    return NextResponse.json({ error: "flight not found" }, { status: 404 });
  }

  return NextResponse.json(flight);
}
