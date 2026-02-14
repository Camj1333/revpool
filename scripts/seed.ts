import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient, ENSURE_TABLES } from "../lib/db";

// Load .env.local so seed works without manual sourcing
const envPath = resolve(__dirname, "../.env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local not found, rely on existing env vars
}

async function seed() {
  const client = createClient();
  await client.connect();

  try {
    await client.query(ENSURE_TABLES);

    // Check if data already exists
    const existing = await client.query("SELECT COUNT(*)::int AS count FROM competitions");
    if (existing.rows[0].count > 0) {
      console.log("Database already seeded, skipping.");
      return;
    }

    console.log("Seeding database...");

    // Insert competitions
    await client.query(`
      INSERT INTO competitions (name, leader, revenue, status, start_date, end_date) VALUES
        ('Q1 Revenue Blitz', 'Sarah Chen', 284500, 'completed', '2025-01-01', '2025-03-31'),
        ('Spring Sprint', 'Marcus Johnson', 192300, 'completed', '2025-04-01', '2025-06-30'),
        ('Summer Showdown', 'Alex Rivera', 347200, 'completed', '2025-07-01', '2025-09-30'),
        ('Fall Frenzy', 'Emily Watson', 156800, 'completed', '2025-10-01', '2025-12-31'),
        ('New Year Kickoff', 'James Park', 423100, 'active', '2026-01-01', '2026-03-31'),
        ('Presidents Day Push', 'Lisa Morgan', 98400, 'active', '2026-02-01', '2026-02-28'),
        ('March Madness Sales', 'David Kim', 0, 'upcoming', '2026-03-01', '2026-03-31'),
        ('Q2 Mega Challenge', 'TBD', 0, 'upcoming', '2026-04-01', '2026-06-30'),
        ('Summer Sales Slam', 'TBD', 0, 'upcoming', '2026-07-01', '2026-09-30')
    `);

    // Insert participants
    await client.query(`
      INSERT INTO participants (name, avatar) VALUES
        ('Sarah Chen', 'SC'),
        ('James Park', 'JP'),
        ('Alex Rivera', 'AR'),
        ('Marcus Johnson', 'MJ'),
        ('Emily Watson', 'EW'),
        ('Lisa Morgan', 'LM'),
        ('David Kim', 'DK'),
        ('Nina Patel', 'NP'),
        ('Chris Taylor', 'CT'),
        ('Jordan Lee', 'JL'),
        ('Rachel Green', 'RG'),
        ('Tom Williams', 'TW'),
        ('Anna Schmidt', 'AS'),
        ('Mike Brown', 'MB'),
        ('Sophie Turner', 'ST')
    `);

    // Insert competition_participants
    // Spread participants across competitions with realistic data
    const assignments: { compId: number; partId: number; revenue: number; deals: number; rank: number; rankChange: number }[] = [
      // Competition 1: Q1 Revenue Blitz (12 participants)
      { compId: 1, partId: 1, revenue: 42000, deals: 5, rank: 1, rankChange: 0 },
      { compId: 1, partId: 3, revenue: 38500, deals: 5, rank: 2, rankChange: 1 },
      { compId: 1, partId: 4, revenue: 35200, deals: 4, rank: 3, rankChange: -1 },
      { compId: 1, partId: 5, revenue: 28700, deals: 3, rank: 4, rankChange: 0 },
      { compId: 1, partId: 8, revenue: 25400, deals: 3, rank: 5, rankChange: 2 },
      { compId: 1, partId: 9, revenue: 22800, deals: 3, rank: 6, rankChange: -1 },
      { compId: 1, partId: 10, revenue: 20100, deals: 2, rank: 7, rankChange: 0 },
      { compId: 1, partId: 11, revenue: 18900, deals: 2, rank: 8, rankChange: 1 },
      { compId: 1, partId: 12, revenue: 17500, deals: 2, rank: 9, rankChange: -2 },
      { compId: 1, partId: 13, revenue: 15400, deals: 2, rank: 10, rankChange: 0 },
      { compId: 1, partId: 14, revenue: 11200, deals: 1, rank: 11, rankChange: 1 },
      { compId: 1, partId: 15, revenue: 8800, deals: 1, rank: 12, rankChange: -1 },

      // Competition 2: Spring Sprint (8 participants)
      { compId: 2, partId: 4, revenue: 38200, deals: 4, rank: 1, rankChange: 2 },
      { compId: 2, partId: 2, revenue: 32100, deals: 4, rank: 2, rankChange: 0 },
      { compId: 2, partId: 6, revenue: 28700, deals: 3, rank: 3, rankChange: 1 },
      { compId: 2, partId: 1, revenue: 25600, deals: 3, rank: 4, rankChange: -2 },
      { compId: 2, partId: 9, revenue: 22400, deals: 2, rank: 5, rankChange: 0 },
      { compId: 2, partId: 10, revenue: 18300, deals: 2, rank: 6, rankChange: 1 },
      { compId: 2, partId: 13, revenue: 15100, deals: 2, rank: 7, rankChange: -1 },
      { compId: 2, partId: 15, revenue: 11900, deals: 1, rank: 8, rankChange: 0 },

      // Competition 3: Summer Showdown (15 participants)
      { compId: 3, partId: 3, revenue: 45200, deals: 6, rank: 1, rankChange: 0 },
      { compId: 3, partId: 1, revenue: 41800, deals: 5, rank: 2, rankChange: 1 },
      { compId: 3, partId: 2, revenue: 38400, deals: 5, rank: 3, rankChange: -1 },
      { compId: 3, partId: 5, revenue: 32100, deals: 4, rank: 4, rankChange: 2 },
      { compId: 3, partId: 6, revenue: 28900, deals: 3, rank: 5, rankChange: 0 },
      { compId: 3, partId: 4, revenue: 25700, deals: 3, rank: 6, rankChange: -2 },
      { compId: 3, partId: 7, revenue: 23400, deals: 3, rank: 7, rankChange: 1 },
      { compId: 3, partId: 8, revenue: 21200, deals: 2, rank: 8, rankChange: -1 },
      { compId: 3, partId: 9, revenue: 18600, deals: 2, rank: 9, rankChange: 0 },
      { compId: 3, partId: 10, revenue: 16800, deals: 2, rank: 10, rankChange: 1 },
      { compId: 3, partId: 11, revenue: 14900, deals: 2, rank: 11, rankChange: -1 },
      { compId: 3, partId: 12, revenue: 12300, deals: 1, rank: 12, rankChange: 0 },
      { compId: 3, partId: 13, revenue: 10500, deals: 1, rank: 13, rankChange: 1 },
      { compId: 3, partId: 14, revenue: 9200, deals: 1, rank: 14, rankChange: -1 },
      { compId: 3, partId: 15, revenue: 8200, deals: 1, rank: 15, rankChange: 0 },

      // Competition 4: Fall Frenzy (10 participants)
      { compId: 4, partId: 5, revenue: 28900, deals: 3, rank: 1, rankChange: 1 },
      { compId: 4, partId: 1, revenue: 25100, deals: 3, rank: 2, rankChange: -1 },
      { compId: 4, partId: 7, revenue: 21500, deals: 3, rank: 3, rankChange: 2 },
      { compId: 4, partId: 2, revenue: 18700, deals: 2, rank: 4, rankChange: 0 },
      { compId: 4, partId: 6, revenue: 16200, deals: 2, rank: 5, rankChange: -1 },
      { compId: 4, partId: 8, revenue: 13800, deals: 2, rank: 6, rankChange: 0 },
      { compId: 4, partId: 11, revenue: 11200, deals: 1, rank: 7, rankChange: 1 },
      { compId: 4, partId: 12, revenue: 9100, deals: 1, rank: 8, rankChange: -1 },
      { compId: 4, partId: 14, revenue: 7300, deals: 1, rank: 9, rankChange: 0 },
      { compId: 4, partId: 15, revenue: 5000, deals: 1, rank: 10, rankChange: 0 },

      // Competition 5: New Year Kickoff (18 participants - all 15 + some have higher revenue)
      { compId: 5, partId: 2, revenue: 52000, deals: 6, rank: 1, rankChange: 2 },
      { compId: 5, partId: 1, revenue: 48200, deals: 5, rank: 2, rankChange: -1 },
      { compId: 5, partId: 3, revenue: 44100, deals: 5, rank: 3, rankChange: 0 },
      { compId: 5, partId: 5, revenue: 38500, deals: 4, rank: 4, rankChange: 1 },
      { compId: 5, partId: 4, revenue: 35200, deals: 4, rank: 5, rankChange: -2 },
      { compId: 5, partId: 6, revenue: 31800, deals: 3, rank: 6, rankChange: 3 },
      { compId: 5, partId: 7, revenue: 28400, deals: 3, rank: 7, rankChange: -1 },
      { compId: 5, partId: 8, revenue: 25100, deals: 3, rank: 8, rankChange: 0 },
      { compId: 5, partId: 9, revenue: 22300, deals: 2, rank: 9, rankChange: 1 },
      { compId: 5, partId: 10, revenue: 19800, deals: 2, rank: 10, rankChange: -1 },
      { compId: 5, partId: 11, revenue: 17600, deals: 2, rank: 11, rankChange: 2 },
      { compId: 5, partId: 12, revenue: 15400, deals: 2, rank: 12, rankChange: -1 },
      { compId: 5, partId: 13, revenue: 13200, deals: 1, rank: 13, rankChange: 0 },
      { compId: 5, partId: 14, revenue: 11400, deals: 1, rank: 14, rankChange: -1 },
      { compId: 5, partId: 15, revenue: 9800, deals: 1, rank: 15, rankChange: 1 },

      // Competition 6: Presidents Day Push (6 participants)
      { compId: 6, partId: 6, revenue: 28400, deals: 3, rank: 1, rankChange: 0 },
      { compId: 6, partId: 1, revenue: 22300, deals: 3, rank: 2, rankChange: 1 },
      { compId: 6, partId: 2, revenue: 18700, deals: 2, rank: 3, rankChange: -1 },
      { compId: 6, partId: 7, revenue: 14200, deals: 2, rank: 4, rankChange: 0 },
      { compId: 6, partId: 9, revenue: 9800, deals: 1, rank: 5, rankChange: 1 },
      { compId: 6, partId: 11, revenue: 5000, deals: 1, rank: 6, rankChange: -1 },

      // Competition 7: March Madness Sales (14 participants, upcoming so revenue = 0)
      { compId: 7, partId: 1, revenue: 0, deals: 0, rank: 1, rankChange: 0 },
      { compId: 7, partId: 2, revenue: 0, deals: 0, rank: 2, rankChange: 0 },
      { compId: 7, partId: 3, revenue: 0, deals: 0, rank: 3, rankChange: 0 },
      { compId: 7, partId: 4, revenue: 0, deals: 0, rank: 4, rankChange: 0 },
      { compId: 7, partId: 5, revenue: 0, deals: 0, rank: 5, rankChange: 0 },
      { compId: 7, partId: 6, revenue: 0, deals: 0, rank: 6, rankChange: 0 },
      { compId: 7, partId: 7, revenue: 0, deals: 0, rank: 7, rankChange: 0 },
      { compId: 7, partId: 8, revenue: 0, deals: 0, rank: 8, rankChange: 0 },
      { compId: 7, partId: 9, revenue: 0, deals: 0, rank: 9, rankChange: 0 },
      { compId: 7, partId: 10, revenue: 0, deals: 0, rank: 10, rankChange: 0 },
      { compId: 7, partId: 11, revenue: 0, deals: 0, rank: 11, rankChange: 0 },
      { compId: 7, partId: 12, revenue: 0, deals: 0, rank: 12, rankChange: 0 },
      { compId: 7, partId: 13, revenue: 0, deals: 0, rank: 13, rankChange: 0 },
      { compId: 7, partId: 14, revenue: 0, deals: 0, rank: 14, rankChange: 0 },
    ];

    for (const a of assignments) {
      await client.query(
        `INSERT INTO competition_participants (competition_id, participant_id, revenue, deals, rank, rank_change)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [a.compId, a.partId, a.revenue, a.deals, a.rank, a.rankChange]
      );
    }

    console.log("Seeding complete!");
    console.log("  - 9 competitions");
    console.log("  - 15 participants");
    console.log(`  - ${assignments.length} competition_participants`);
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
