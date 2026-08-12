import * as mock from "./mock";

const providers = { mock };
const active = providers[process.env.NEXT_PUBLIC_FLIGHT_PROVIDER] ?? mock;

export async function getFlight(flightNumber) {
  try {
    const result = await active.getFlight(flightNumber);
    if (result) return result;
  } catch (err) {
    console.error("flight provider failed, falling back to mock:", err);
  }
  return mock.getFlight(flightNumber);
}

export async function listFlights(direction) {
  try {
    return await active.listFlights(direction);
  } catch {
    return mock.listFlights(direction);
  }
}

export { scenarios } from "./mock";
