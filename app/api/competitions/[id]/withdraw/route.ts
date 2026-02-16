import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { withDb } from "@/lib/db";
import { ensureParticipant } from "@/lib/ensure-participant";

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
    return NextResponse.json({ error: "Only reps can request withdrawals" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await withDb(async (client) => {
      // Check competition is completed
      const comp = await client.query(
        `SELECT status, prize FROM competitions WHERE id = $1`,
        [id]
      );
      if (comp.rows.length === 0) {
        return { error: "Competition not found", status: 404 };
      }
      if (comp.rows[0].status !== "completed") {
        return { error: "Competition is not completed", status: 400 };
      }

      const participantId = await ensureParticipant(
        client,
        user.id,
        user.participantId,
        user.name || "Unknown"
      );

      // Check rep is rank 1
      const rank = await client.query(
        `SELECT rank FROM competition_participants
         WHERE competition_id = $1 AND participant_id = $2`,
        [id, participantId]
      );
      if (rank.rows.length === 0 || rank.rows[0].rank !== 1) {
        return { error: "Only the rank 1 winner can request withdrawal", status: 403 };
      }

      const prize = Number(comp.rows[0].prize);
      if (prize <= 0) {
        return { error: "No prize to withdraw", status: 400 };
      }

      // Insert withdrawal request (unique constraint prevents duplicates)
      const res = await client.query(
        `INSERT INTO prize_withdrawals (competition_id, user_id, amount)
         VALUES ($1, $2, $3) RETURNING *`,
        [id, user.id, prize]
      );

      return { row: res.rows[0] };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.row);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: "Withdrawal already requested" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
