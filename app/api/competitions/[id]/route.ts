import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { withDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const row = await withDb(async (client) => {
      const res = await client.query(
        `SELECT c.id, c.name, c.leader, c.revenue, c.status, c.prize,
                c.start_date AS "startDate", c.end_date AS "endDate",
                COUNT(cp.id)::int AS participants
         FROM competitions c
         LEFT JOIN competition_participants cp ON cp.competition_id = c.id
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      return res.rows[0] || null;
    });
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;
  if (user.role !== "manager") {
    return NextResponse.json({ error: "Only managers can delete competitions" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const deleted = await withDb(async (client) => {
      const res = await client.query(
        `DELETE FROM competitions WHERE id = $1 RETURNING id`,
        [id]
      );
      return res.rows[0] || null;
    });

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
