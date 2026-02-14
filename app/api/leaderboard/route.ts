import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";

export async function GET() {
  try {
    const rows = await withDb(async (client) => {
      const res = await client.query(`
        SELECT p.id, p.name, p.avatar,
               SUM(cp.revenue)::numeric AS revenue,
               SUM(cp.deals)::int AS deals,
               RANK() OVER (ORDER BY SUM(cp.revenue) DESC)::int AS rank,
               0 AS change
        FROM participants p
        JOIN competition_participants cp ON cp.participant_id = p.id
        GROUP BY p.id
        ORDER BY rank ASC
      `);
      return res.rows;
    });
    return NextResponse.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
