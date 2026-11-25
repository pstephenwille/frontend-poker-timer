import { CreateTournament, ErrorEnvelope, Tournament } from '@pstephenwille/poker-timer-contracts';

const TOURNAMENTS_URL = '/api/tournaments';

/** The backend refused the Tournament and said why, in words meant for the person recording it. */
export class TournamentRefusedError extends Error {}

async function refusalMessage(response: Response): Promise<string | null> {
  const envelope = ErrorEnvelope.safeParse(await response.json().catch(() => null));

  return envelope.success ? envelope.data.error.message : null;
}

export async function recordTournament(details: CreateTournament): Promise<Tournament> {
  const response = await fetch(TOURNAMENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  if (!response.ok) {
    const message = await refusalMessage(response);
    if (message) throw new TournamentRefusedError(message);
    throw new Error(`POST ${TOURNAMENTS_URL} answered ${response.status}`);
  }

  return Tournament.parse(await response.json());
}
