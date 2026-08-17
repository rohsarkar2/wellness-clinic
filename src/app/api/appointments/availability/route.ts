import { getAvailability } from "@/lib/server/availability";
import { errorResponse, jsonError } from "@/lib/server/http";

/** GET /api/appointments/availability?doctorId=…&date=YYYY-MM-DD */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId")?.trim() ?? "";
  const date = searchParams.get("date")?.trim() ?? "";

  if (!doctorId || !date) {
    return jsonError("A doctor and a date are required.", 400);
  }

  try {
    return Response.json(await getAvailability(doctorId, date));
  } catch (error) {
    return errorResponse(error, "Could not load availability.");
  }
}
