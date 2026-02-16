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
        `SELECT cf.id, cf.competition_id AS "competitionId",
                u.name AS "userName", cf.amount, cf.created_at AS "createdAt"
         FROM competition_funding cf
         JOIN users u ON u.id = cf.user_id
         WHERE cf.competition_id = $1
         ORDER BY cf.created_at DESC`,
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
