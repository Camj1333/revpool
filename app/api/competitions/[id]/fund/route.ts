import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { withDb } from "@/lib/db";

export async function POST(
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
    return NextResponse.json({ error: "Only managers can fund competitions" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const amount = Number(body.amount);

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
  }

  try {
    const row = await withDb(async (client) => {
      // Insert funding transaction
      const res = await client.query(
        `INSERT INTO competition_funding (competition_id, user_id, amount)
         VALUES ($1, $2, $3) RETURNING *`,
        [id, user.id, amount]
      );

      // Increment competition prize
      await client.query(
        `UPDATE competitions SET prize = prize + $1 WHERE id = $2`,
        [amount, id]
      );

      return res.rows[0];
    });

    return NextResponse.json(row);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
