import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { withDb } from "@/lib/db";
import { ensureParticipant } from "@/lib/ensure-participant";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await withDb(async (client) => {
      const participantId = await ensureParticipant(
        client,
        session.user!.id!,
        (session.user as Record<string, unknown>).participantId as number | null,
        session.user!.name || "Unknown"
      );
      // Get active competition info for this rep
      const activeCompRes = await client.query(`
        SELECT c.id, c.name, c.end_date,
               cp.revenue, cp.deals, cp.rank,
               (SELECT COUNT(*)::int FROM competition_participants WHERE competition_id = c.id) AS total_participants
        FROM competitions c
        JOIN competition_participants cp ON cp.competition_id = c.id AND cp.participant_id = $1
        WHERE c.status = 'active'
        ORDER BY c.end_date ASC
        LIMIT 1
      `, [participantId]);

      const activeComp = activeCompRes.rows[0] || null;

      // Get total revenue across all competitions for this rep
      const totalRes = await client.query(`
        SELECT COALESCE(SUM(revenue), 0)::numeric AS total_revenue,
               COALESCE(SUM(deals), 0)::int AS total_deals
        FROM competition_participants WHERE participant_id = $1
      `, [participantId]);

      // Get global rank
      const globalRankRes = await client.query(`
        SELECT rank FROM (
          SELECT participant_id, RANK() OVER (ORDER BY SUM(revenue) DESC)::int AS rank
          FROM competition_participants
          GROUP BY participant_id
        ) ranked WHERE participant_id = $1
      `, [participantId]);

      const totalParticipantsRes = await client.query(`
        SELECT COUNT(DISTINCT participant_id)::int AS count FROM competition_participants
      `);

      // Revenue history per competition
      const historyRes = await client.query(`
        SELECT c.name AS label, cp.revenue::numeric AS value
        FROM competition_participants cp
        JOIN competitions c ON c.id = cp.competition_id
        WHERE cp.participant_id = $1 AND c.status != 'upcoming'
        ORDER BY c.id ASC
      `, [participantId]);

      // Active competition leaderboard
      let leaderboard: Record<string, unknown>[] = [];
      if (activeComp) {
        const lbRes = await client.query(`
          SELECT p.id, p.name, p.avatar, cp.revenue::numeric AS revenue,
                 cp.deals, cp.rank, cp.rank_change AS change
          FROM competition_participants cp
          JOIN participants p ON p.id = cp.participant_id
          WHERE cp.competition_id = $1
          ORDER BY cp.rank ASC
        `, [activeComp.id]);
        leaderboard = lbRes.rows;
      }

      function formatCurrency(n: number): string {
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
        return `$${n.toFixed(0)}`;
      }

      const totalRevenue = Number(totalRes.rows[0].total_revenue);
      const globalRank = globalRankRes.rows[0]?.rank ?? 0;
      const totalParts = totalParticipantsRes.rows[0].count;

      const kpis = [
        {
          label: "Quota Progress",
          value: activeComp ? formatCurrency(Number(activeComp.revenue)) : "$0",
          change: 0,
          changeLabel: activeComp ? `in ${activeComp.name}` : "no active competition",
        },
        {
          label: "Committed Amount",
          value: formatCurrency(totalRevenue),
          change: 0,
          changeLabel: "all-time total",
        },
        {
          label: "Pool Value",
          value: activeComp ? formatCurrency(Number(activeComp.revenue) * 0.15) : "$0",
          change: 0,
          changeLabel: "estimated payout",
        },
        {
          label: "Leaderboard Position",
          value: `#${globalRank} of ${totalParts}`,
          change: 0,
          changeLabel: "global ranking",
        },
      ];

      return {
        userName: session.user!.name,
        activeCompetition: activeComp ? {
          id: activeComp.id,
          name: activeComp.name,
          endDate: activeComp.end_date,
          rank: activeComp.rank,
          totalParticipants: activeComp.total_participants,
        } : null,
        kpis,
        history: historyRes.rows,
        leaderboard,
        participantId,
      };
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
