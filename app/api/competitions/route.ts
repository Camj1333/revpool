import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db";

export async function GET() {
  try {
    const rows = await withDb(async (client) => {
      const res = await client.query(`
        SELECT c.id, c.name, c.leader, c.revenue, c.status,
               c.start_date AS "startDate", c.end_date AS "endDate",
               COUNT(cp.id)::int AS participants
        FROM competitions c
        LEFT JOIN competition_participants cp ON cp.competition_id = c.id
        GROUP BY c.id
        ORDER BY c.id ASC
      `);
      return res.rows;
    });
    return NextResponse.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, status, startDate, endDate } = await req.json();
  try {
    const row = await withDb(async (client) => {
      const res = await client.query(
        `INSERT INTO competitions(name, status, start_date, end_date)
         VALUES($1, COALESCE($2, 'upcoming'), $3, $4)
         RETURNING id, name, leader, revenue, status,
                   start_date AS "startDate", end_date AS "endDate"`,
        [name, status || null, startDate || null, endDate || null]
      );
      return { ...res.rows[0], participants: 0 };
    });
    return NextResponse.json(row);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
