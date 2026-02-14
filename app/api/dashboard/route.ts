import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";

export async function GET() {
  try {
    const kpis = await withDb(async (client) => {
      const revenueRes = await client.query(
        `SELECT COALESCE(SUM(revenue), 0)::numeric AS total FROM competitions`
      );
      const totalRevenue = Number(revenueRes.rows[0].total);

      const activeRes = await client.query(
        `SELECT COUNT(*)::int AS count FROM competitions WHERE status = 'active'`
      );
      const activeCount = activeRes.rows[0].count;

      const participantsRes = await client.query(
        `SELECT COUNT(DISTINCT participant_id)::int AS count FROM competition_participants`
      );
      const totalParticipants = participantsRes.rows[0].count;

      const dealsRes = await client.query(
        `SELECT COALESCE(SUM(revenue), 0)::numeric AS total_revenue,
                COALESCE(SUM(deals), 0)::int AS total_deals
         FROM competition_participants`
      );
      const totalDeals = Number(dealsRes.rows[0].total_deals);
      const avgDeal = totalDeals > 0
        ? Number(dealsRes.rows[0].total_revenue) / totalDeals
        : 0;

      function formatCurrency(n: number): string {
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
        if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
        return `$${n.toFixed(0)}`;
      }

      return [
        { label: "Total Revenue", value: formatCurrency(totalRevenue), change: 0, changeLabel: "vs last quarter" },
        { label: "Active Competitions", value: String(activeCount), change: 0, changeLabel: "this month" },
        { label: "Total Participants", value: String(totalParticipants), change: 0, changeLabel: "vs last quarter" },
        { label: "Avg Deal Size", value: formatCurrency(avgDeal), change: 0, changeLabel: "vs last quarter" },
      ];
    });
    return NextResponse.json(kpis);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
