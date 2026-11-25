const padToTwoDigits = (value: number) => String(value).padStart(2, '0');

/** A datetime-local field holds the viewer's local wall-clock time, to the minute. */
export function toLocalDateTimeInput(epochMillis: number): string {
  const time = new Date(epochMillis);
  const date = `${time.getFullYear()}-${padToTwoDigits(time.getMonth() + 1)}-${padToTwoDigits(time.getDate())}`;

  return `${date}T${padToTwoDigits(time.getHours())}:${padToTwoDigits(time.getMinutes())}`;
}

/** Date parses a date and time without an offset as local time, the way the field shows it. */
export const fromLocalDateTimeInput = (value: string) => new Date(value).getTime();

export function initialPlayedOn(playedOnParam: string | null): string {
  const playedOnFromUrl = Number(playedOnParam);
  const hasPlayedOnInUrl = playedOnParam !== null && Number.isInteger(playedOnFromUrl);

  return toLocalDateTimeInput(hasPlayedOnInUrl ? playedOnFromUrl : Date.now());
}
