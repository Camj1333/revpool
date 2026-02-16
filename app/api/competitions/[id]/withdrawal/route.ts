import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { withDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const rows = await withDb(async (client) => {
      const res = await client.query(
        `SELECT pw.id, pw.competition_id AS "competitionId",
                u.name AS "userName", pw.amount, pw.status, pw.created_at AS "createdAt"
         FROM prize_withdrawals pw
         JOIN users u ON u.id = pw.user_id
         WHERE pw.competition_id = $1
         ORDER BY pw.created_at DESC`,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;
  if (user.role !== "manager") {
    return NextResponse.json({ error: "Only managers can update withdrawal status" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { withdrawalId, status } = body;

  if (!withdrawalId || !["approved", "paid"].includes(status)) {
    return NextResponse.json({ error: "Invalid withdrawalId or status" }, { status: 400 });
  }

  try {
    const row = await withDb(async (client) => {
      const res = await client.query(
        `UPDATE prize_withdrawals SET status = $1, updated_at = NOW()
         WHERE id = $2 AND competition_id = $3
         RETURNING *`,
        [status, withdrawalId, id]
      );
      return res.rows[0] || null;
    });

    if (!row) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
