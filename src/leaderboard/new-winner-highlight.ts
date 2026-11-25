/**
 * Carried in the router's location state rather than the URL, so only the navigation
 * straight after a save highlights the Winner, and a shared or bookmarked link never does.
 */
interface NewWinnerHighlight {
  newWinnerId: string;
}

export const highlightNewWinner = (winnerId: string): NewWinnerHighlight => ({ newWinnerId: winnerId });

export function newWinnerIdFrom(locationState: unknown): string | null {
  if (typeof locationState !== 'object' || locationState === null) return null;
  if (!('newWinnerId' in locationState) || typeof locationState.newWinnerId !== 'string') return null;

  return locationState.newWinnerId;
}
