import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { withDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await withDb(async (client) => {
      // Team quota attainment: total revenue / estimated quota
      const revenueRes = await client.query(
        "SELECT COALESCE(SUM(revenue), 0)::numeric AS total FROM competitions"
      );
      const totalRevenue = Number(revenueRes.rows[0].total);

      // Participation rate
      const totalPartsRes = await client.query(
        "SELECT COUNT(*)::int AS count FROM participants"
      );
      const activePartsRes = await client.query(
        `SELECT COUNT(DISTINCT cp.participant_id)::int AS count
         FROM competition_participants cp
         JOIN competitions c ON c.id = cp.competition_id
         WHERE c.status = 'active'`
      );
      const participationRate = totalPartsRes.rows[0].count > 0
        ? Math.round((activePartsRes.rows[0].count / totalPartsRes.rows[0].count) * 100)
        : 0;

      // Active pools count
      const activePoolsRes = await client.query(
        "SELECT COUNT(*)::int AS count FROM competitions WHERE status = 'active'"
      );

      // Revenue impact from active competitions
      const activeRevenueRes = await client.query(
        "SELECT COALESCE(SUM(revenue), 0)::numeric AS total FROM competitions WHERE status = 'active'"
      );

      function formatCurrency(n: number): string {
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
        if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
        return `$${n.toFixed(0)}`;
      }

      // Estimate quota attainment (using total revenue / number of completed + active comps * avg target)
      const completedCount = await client.query(
        "SELECT COUNT(*)::int AS count FROM competitions WHERE status IN ('active', 'completed')"
      );
      const quotaAttainment = completedCount.rows[0].count > 0
        ? Math.round((totalRevenue / (completedCount.rows[0].count * 200000)) * 100)
        : 0;

      const kpis = [
        { label: "Participation Rate", value: `${participationRate}%`, change: 0, changeLabel: "of team enrolled" },
        { label: "Active Revenue", value: formatCurrency(Number(activeRevenueRes.rows[0].total)), change: 0, changeLabel: "active competitions" },
        { label: "Active Pools", value: String(activePoolsRes.rows[0].count), change: 0, changeLabel: "running now" },
      ];

      // Active competitions table
      const activePoolsTableRes = await client.query(`
        SELECT c.id, c.name, c.status, c.leader, c.revenue::numeric AS revenue,
               c.end_date AS "endDate",
               (SELECT COUNT(*)::int FROM competition_participants WHERE competition_id = c.id) AS participants
        FROM competitions c
        WHERE c.status = 'active'
        ORDER BY c.end_date ASC
      `);

      // Global leaderboard
      const leaderboardRes = await client.query(`
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

      return {
        kpis,
        activePools: activePoolsTableRes.rows,
        leaderboard: leaderboardRes.rows,
      };
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
