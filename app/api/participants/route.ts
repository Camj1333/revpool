import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";

export async function GET() {
  try {
    const rows = await withDb(async (client) => {
      const res = await client.query("SELECT id, name FROM participants ORDER BY name ASC");
      return res.rows;
    });
    return NextResponse.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
