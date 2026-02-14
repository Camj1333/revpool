import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await withDb(async (client) => {
      const res = await client.query(
        `SELECT p.id, p.name, p.avatar,
                cp.revenue, cp.deals, cp.rank,
                cp.rank_change AS change
         FROM competition_participants cp
         JOIN participants p ON p.id = cp.participant_id
         WHERE cp.competition_id = $1
         ORDER BY cp.rank ASC`,
        [id]
      );
      return res.rows;
    });
    return NextResponse.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
