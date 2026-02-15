import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { withDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, participantId } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (role && !["rep", "manager"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await withDb(async (client) => {
      const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        return null;
      }

      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, participant_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, role, participant_id`,
        [name, email, passwordHash, role || "rep", participantId || null]
      );
      return res.rows[0];
    });

    if (!user) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
