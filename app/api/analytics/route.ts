import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";

export async function GET() {
  try {
    const data = await withDb(async (client) => {
      const monthlyRes = await client.query(`
        SELECT TO_CHAR(start_date, 'Mon') AS label,
               SUM(revenue)::numeric AS value
        FROM competitions
        WHERE start_date IS NOT NULL
        GROUP BY DATE_TRUNC('month', start_date), TO_CHAR(start_date, 'Mon')
        ORDER BY DATE_TRUNC('month', start_date) ASC
      `);

      const competitionRes = await client.query(`
        SELECT name AS label, revenue::numeric AS value
        FROM competitions
        WHERE revenue > 0
        ORDER BY id ASC
      `);

      return {
        monthlyRevenue: monthlyRes.rows,
        competitionRevenue: competitionRes.rows,
      };
    });
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
