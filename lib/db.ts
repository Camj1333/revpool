import { Client } from "@neondatabase/serverless";

export function createClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
  });
}

export const ENSURE_TABLES = `
CREATE TABLE IF NOT EXISTS competitions (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  leader      TEXT NOT NULL DEFAULT 'TBD',
  revenue     NUMERIC NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'upcoming'
              CHECK (status IN ('active', 'completed', 'upcoming')),
  start_date  DATE,
  end_date    DATE
);

CREATE TABLE IF NOT EXISTS participants (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL,
  avatar  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS competition_participants (
  id               SERIAL PRIMARY KEY,
  competition_id   INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  participant_id   INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  revenue          NUMERIC NOT NULL DEFAULT 0,
  deals            INTEGER NOT NULL DEFAULT 0,
  rank             INTEGER NOT NULL DEFAULT 0,
  rank_change      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (competition_id, participant_id)
);
`;

export async function withDb<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = createClient();
  await client.connect();
  try {
    await client.query(ENSURE_TABLES);
    return await fn(client);
  } finally {
    await client.end();
  }
}
