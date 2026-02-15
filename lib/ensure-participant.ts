import { Client } from "@neondatabase/serverless";

/**
 * Given a user ID and session participantId, resolve the actual participant_id.
 * If the user has no participant record, create one and link it.
 * Returns the participant_id (never null).
 */
export async function ensureParticipant(
  client: Client,
  userId: string,
  sessionParticipantId: number | null,
  userName: string
): Promise<number> {
  // If session already has a participantId, verify it exists
  if (sessionParticipantId) {
    return sessionParticipantId;
  }

  // Check DB for current participant_id (may have been updated since JWT was issued)
  const userRow = await client.query(
    "SELECT participant_id FROM users WHERE id = $1",
    [userId]
  );
  if (userRow.rows[0]?.participant_id) {
    return userRow.rows[0].participant_id;
  }

  // Create a new participant and link it to the user
  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newPart = await client.query(
    "INSERT INTO participants (name, avatar) VALUES ($1, $2) RETURNING id",
    [userName, initials]
  );
  const participantId = newPart.rows[0].id;

  await client.query(
    "UPDATE users SET participant_id = $1 WHERE id = $2",
    [participantId, userId]
  );

  return participantId;
}
