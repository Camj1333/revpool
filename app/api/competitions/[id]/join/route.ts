import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { withDb } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;
  if (user.role !== "rep") {
    return NextResponse.json({ error: "Only reps can join competitions" }, { status: 403 });
  }

  const participantId = user.participantId;
  if (!participantId) {
    return NextResponse.json({ error: "No participant profile linked" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const row = await withDb(async (client) => {
      // Check if already enrolled
      const existing = await client.query(
        `SELECT id FROM competition_participants WHERE competition_id = $1 AND participant_id = $2`,
        [id, participantId]
      );
      if (existing.rows.length > 0) {
        return null; // already joined
      }

      const res = await client.query(
        `INSERT INTO competition_participants (competition_id, participant_id, revenue, deals, rank, rank_change)
         VALUES ($1, $2, 0, 0, 0, 0)
         RETURNING *`,
        [id, participantId]
      );
      return res.rows[0];
    });

    if (!row) {
      return NextResponse.json({ error: "Already joined" }, { status: 409 });
    }

    return NextResponse.json(row, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
