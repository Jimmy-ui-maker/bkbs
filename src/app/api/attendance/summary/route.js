import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const learnerId = searchParams.get("learnerId");
  const session = searchParams.get("session");
  const term = searchParams.get("term");

  if (!learnerId || !session || !term)
    return Response.json({ success: false, error: "Missing parameters" });

  const attendanceDoc = await Attendance.findOne({ session, "terms.term": term });

  if (!attendanceDoc)
    return Response.json({ success: true, presentCount: 0 });

  const termEntry = attendanceDoc.terms.find((t) => t.term === term);
  if (!termEntry) return Response.json({ success: true, presentCount: 0 });

  let presentCount = 0;
  for (const day of termEntry.attendance) {
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
