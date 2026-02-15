import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { withDb } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;

  try {
    const ids = await withDb(async (client) => {
      // Look up current participant_id from DB (session JWT may be stale)
      let participantId = user.participantId;
      if (!participantId) {
        const userRow = await client.query(
          "SELECT participant_id FROM users WHERE id = $1",
          [user.id]
        );
        participantId = userRow.rows[0]?.participant_id;
      }

      if (!participantId) {
        return [];
      }

      const res = await client.query(
        `SELECT competition_id FROM competition_participants WHERE participant_id = $1`,
        [participantId]
      );
      return res.rows.map((r: { competition_id: number }) => r.competition_id);
    });
    return NextResponse.json(ids);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
