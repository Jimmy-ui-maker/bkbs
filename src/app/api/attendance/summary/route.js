// /api/attendance/summary/route.js
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance"; // your mongoose model

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const learnerId = searchParams.get("learnerId");
  const session = searchParams.get("session");
  const term = searchParams.get("term");

  if (!learnerId || !session || !term) {
    return Response.json({ success: false, error: "Missing params" });
  }

  const records = await Attendance.find({
    "records.learnerId": learnerId,
    session,
    term,
  });

  // flatten all daily records
  let presentCount = 0;
  for (const day of records) {
    for (const rec of day.records) {
      if (
        String(rec.learnerId) === String(learnerId) &&
        rec.status === "Present"
      ) {
        presentCount++;
      }
    }
  }

  return Response.json({ success: true, presentCount });
}
