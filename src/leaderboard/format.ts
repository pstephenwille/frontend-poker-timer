const NOT_APPLICABLE = '—';

export const formatWinRate = (winRate: number | null) =>
  winRate === null ? NOT_APPLICABLE : `${Math.round(winRate * 100)}%`;

export const formatDollars = (dollars: number) => `$${dollars.toLocaleString()}`;

export const formatOptional = (text: string | null) => text ?? NOT_APPLICABLE;
