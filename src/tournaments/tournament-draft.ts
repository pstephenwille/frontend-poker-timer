import {
  ImageContentType,
  MAX_UPLOAD_BYTES,
  MIN_PARTICIPANTS,
  type CreateTournament,
  type HandCategory,
} from '@pstephenwille/poker-timer-contracts';

/** The form's fields as entered, before they are known to make a valid Tournament. */
export interface TournamentDraft {
  participantIds: string[];
  winnerId: string;
  winningHand: HandCategory | '';
  pot: string;
  /** Epoch milliseconds, or NaN while the field is empty. */
  playedOn: number;
  finalHandOpponentIds: string[];
  note: string;
  photo: File | null;
}

const BYTES_PER_MEGABYTE = 1024 * 1024;

/** Checked before saving, because storage would refuse it only after the Tournament is already recorded. */
function photoProblem(photo: File | null): string | null {
  if (!photo) return null;
  if (!ImageContentType.safeParse(photo.type).success) return 'The photo must be a JPEG, PNG, HEIC or WebP image.';
  if (photo.size > MAX_UPLOAD_BYTES) return `The photo must be ${MAX_UPLOAD_BYTES / BYTES_PER_MEGABYTE} MB or smaller.`;

  return null;
}

const optionalFields = ({ finalHandOpponentIds, note }: TournamentDraft) => ({
  ...(finalHandOpponentIds.length > 0 && { finalHandOpponentIds }),
  ...(note.trim() && { note }),
});

const WHOLE_DOLLARS = /^\d+$/;

function playedOnProblem(playedOn: number, now: number): string | null {
  if (Number.isNaN(playedOn)) return 'Enter when the Tournament was played.';
  if (playedOn > now) return "Played on can't be in the future";

  return null;
}

export function draftProblems(draft: TournamentDraft, now: number): string[] {
  const problems = [
    draft.participantIds.length < MIN_PARTICIPANTS && 'Check at least two Participants.',
    !draft.winnerId && 'Choose the Winner.',
    !draft.winningHand && 'Choose the Winning Hand.',
    !WHOLE_DOLLARS.test(draft.pot) && 'Enter the Pot in whole dollars.',
    playedOnProblem(draft.playedOn, now),
    photoProblem(draft.photo),
  ];

  return problems.filter((problem) => typeof problem === 'string');
}

/** Call only once draftProblems finds none, so every field is known to be filled in. */
export function toCreateTournament(draft: TournamentDraft): CreateTournament {
  if (!draft.winningHand) throw new Error('toCreateTournament needs a draft with no problems, but it has no Winning Hand');

  return {
    playedOn: draft.playedOn,
    participantIds: draft.participantIds,
    winnerId: draft.winnerId,
    winningHand: draft.winningHand,
    pot: Number(draft.pot),
    ...optionalFields(draft),
  };
}
