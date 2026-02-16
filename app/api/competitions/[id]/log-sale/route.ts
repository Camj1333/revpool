import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { withDb } from "@/lib/db";
import { ensureParticipant } from "@/lib/ensure-participant";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;
  if (user.role !== "rep") {
    return NextResponse.json({ error: "Only reps can log sales" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const revenue = Number(body.revenue);
  const deals = Number(body.deals);

  if (!revenue || revenue <= 0 || !deals || deals <= 0) {
    return NextResponse.json({ error: "Revenue and deals must be positive numbers" }, { status: 400 });
  }

  try {
    const row = await withDb(async (client) => {
      const participantId = await ensureParticipant(
        client,
        user.id,
        user.participantId,
        user.name || "Unknown"
      );

      // Verify the rep is enrolled in this competition
      const enrollment = await client.query(
        `SELECT id FROM competition_participants WHERE competition_id = $1 AND participant_id = $2`,
        [id, participantId]
      );
      if (enrollment.rows.length === 0) {
        return null;
      }

      // Increment participant stats
      const res = await client.query(
        `UPDATE competition_participants
         SET revenue = revenue + $1, deals = deals + $2
         WHERE competition_id = $3 AND participant_id = $4
         RETURNING *`,
        [revenue, deals, id, participantId]
      );

      // Keep competition total revenue in sync
      await client.query(
        `UPDATE competitions SET revenue = revenue + $1 WHERE id = $2`,
        [revenue, id]
      );

      return res.rows[0];
    });

    if (!row) {
      return NextResponse.json({ error: "Not enrolled in this competition" }, { status: 403 });
    }

    return NextResponse.json(row);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
