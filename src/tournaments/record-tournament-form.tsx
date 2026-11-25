import {
  HAND_CATEGORIES,
  HandCategory,
  ImageContentType,
  MAX_NOTE_LENGTH,
  type MemberSummary,
} from '@pstephenwille/poker-timer-contracts';
import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { LEADERBOARD_PATH } from '../app-paths';
import { handName } from '../leaderboard/hand-names';
import { highlightNewWinner } from '../leaderboard/new-winner-highlight';
import { fromLocalDateTimeInput, initialPlayedOn, toLocalDateTimeInput } from './played-on';
import { draftProblems, toCreateTournament, type TournamentDraft } from './tournament-draft';
import { uploadTournamentPhoto } from './photo-api';
import { recordTournament, TournamentRefusedError } from './tournaments-api';
import { useActiveMembers } from './use-active-members';

const MEMBERS_FAILED_MESSAGE = "The Members couldn't be loaded. Reload the page to try again.";
const SAVE_FAILED_MESSAGE = "The Tournament couldn't be recorded. Try again.";
const PHOTO_FAILED_MESSAGE = "Tournament recorded. The photo didn't upload.";
const HANDS_STRONGEST_FIRST = [...HAND_CATEGORIES].reverse();
const ACCEPTED_PHOTO_TYPES = ImageContentType.options.join(',');

const withoutId = (ids: string[], idToRemove: string) => ids.filter((id) => id !== idToRemove);

function MemberChoices({ legend, members, checkedIds, onToggle }: {
  legend: string;
  members: MemberSummary[];
  checkedIds: string[];
  onToggle: (memberId: string) => void;
}) {
  return (
    <fieldset className="member-choices">
      <legend>{legend}</legend>
      {members.map((member) => (
        <label key={member.id}>
          <input type="checkbox" checked={checkedIds.includes(member.id)} onChange={() => onToggle(member.id)} />
          {member.displayName}
        </label>
      ))}
    </fieldset>
  );
}

function Problems({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  return (
    <ul role="alert" className="record-tournament-problems">
      {messages.map((message) => <li key={message}>{message}</li>)}
    </ul>
  );
}

/** Once the Tournament is recorded its id is kept, so a retried photo goes to it rather than recording it again. */
type SavePhase =
  | { status: 'editing' }
  | { status: 'saving' }
  | { status: 'photoFailed'; tournamentId: string }
  | { status: 'retryingPhoto'; tournamentId: string };

function PhotoRetry({ isRetrying, onTryAgain, onSkip }: {
  isRetrying: boolean;
  onTryAgain: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="photo-retry">
      {!isRetrying && <p role="alert">{PHOTO_FAILED_MESSAGE}</p>}
      <button type="button" disabled={isRetrying} onClick={onTryAgain}>Try again</button>
      <button type="button" disabled={isRetrying} onClick={onSkip}>Skip photo</button>
    </div>
  );
}

function FormActions({ phase, onRetryPhoto, onSkipPhoto }: {
  phase: SavePhase;
  onRetryPhoto: (tournamentId: string) => void;
  onSkipPhoto: () => void;
}) {
  if (phase.status === 'editing' || phase.status === 'saving') {
    return <button type="submit" disabled={phase.status === 'saving'}>Save</button>;
  }

  return (
    <PhotoRetry
      isRetrying={phase.status === 'retryingPhoto'}
      onTryAgain={() => onRetryPhoto(phase.tournamentId)}
      onSkip={onSkipPhoto}
    />
  );
}

function saveFailureMessage(error: unknown): string {
  if (error instanceof TournamentRefusedError) return error.message;

  console.error('The Tournament could not be recorded', error);

  return SAVE_FAILED_MESSAGE;
}

function RecordTournamentFields({ members }: { members: MemberSummary[] }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [draft, setDraft] = useState<TournamentDraft>(() => ({
    participantIds: [],
    winnerId: '',
    winningHand: '',
    pot: '',
    playedOn: initialPlayedOn(searchParams.get('playedOn')),
    finalHandOpponentIds: [],
    note: '',
    photo: null,
  }));
  const [problems, setProblems] = useState<string[]>([]);
  const [phase, setPhase] = useState<SavePhase>({ status: 'editing' });
  const areFieldsLocked = phase.status !== 'editing';

  const updateDraft = (changes: Partial<TournamentDraft>) => setDraft((current) => ({ ...current, ...changes }));
  const checkedParticipants = members.filter((member) => draft.participantIds.includes(member.id));
  const opponentCandidates = checkedParticipants.filter((member) => member.id !== draft.winnerId);

  const toggleParticipant = (memberId: string) => setDraft((current) => {
    const isUnchecking = current.participantIds.includes(memberId);
    if (!isUnchecking) return { ...current, participantIds: [...current.participantIds, memberId] };

    return {
      ...current,
      participantIds: withoutId(current.participantIds, memberId),
      winnerId: current.winnerId === memberId ? '' : current.winnerId,
      finalHandOpponentIds: withoutId(current.finalHandOpponentIds, memberId),
    };
  });

  const chooseWinner = (winnerId: string) => setDraft((current) => ({
    ...current,
    winnerId,
    finalHandOpponentIds: withoutId(current.finalHandOpponentIds, winnerId),
  }));

  const toggleOpponent = (memberId: string) => setDraft((current) => {
    const isUnchecking = current.finalHandOpponentIds.includes(memberId);
    const finalHandOpponentIds = isUnchecking
      ? withoutId(current.finalHandOpponentIds, memberId)
      : [...current.finalHandOpponentIds, memberId];

    return { ...current, finalHandOpponentIds };
  });

  const showLeaderboard = () => navigate(LEADERBOARD_PATH, { state: highlightNewWinner(draft.winnerId) });

  const attachPhoto = async (tournamentId: string) => {
    if (!draft.photo) return showLeaderboard();

    try {
      await uploadTournamentPhoto(tournamentId, draft.photo);
      showLeaderboard();
    } catch (error) {
      console.error('The photo could not be uploaded', error);
      setPhase({ status: 'photoFailed', tournamentId });
    }
  };

  const retryPhoto = (tournamentId: string) => {
    setPhase({ status: 'retryingPhoto', tournamentId });
    attachPhoto(tournamentId);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const draftIssues = draftProblems(draft, Date.now());
    setProblems(draftIssues);
    if (draftIssues.length > 0) return;

    setPhase({ status: 'saving' });
    const tournament = await recordTournament(toCreateTournament(draft)).catch((error: unknown) => {
      setProblems([saveFailureMessage(error)]);
      setPhase({ status: 'editing' });

      return null;
    });
    if (tournament) await attachPhoto(tournament.id);
  };

  return (
    <form aria-label="Record a Tournament" className="record-tournament-form" noValidate onSubmit={save}>
      <fieldset className="record-tournament-fields" disabled={areFieldsLocked}>
        <MemberChoices
          legend="Participants"
          members={members}
          checkedIds={draft.participantIds}
          onToggle={toggleParticipant}
        />
        <label>
          Winner
          <select value={draft.winnerId} onChange={(event) => chooseWinner(event.target.value)}>
            <option value="">Choose the Winner</option>
            {checkedParticipants.map((member) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
          </select>
        </label>
        <label>
          Winning Hand
          <select
            value={draft.winningHand}
            onChange={(event) => updateDraft({ winningHand: HandCategory.safeParse(event.target.value).data ?? '' })}
          >
            <option value="">Choose the Winning Hand</option>
            {HANDS_STRONGEST_FIRST.map((hand) => <option key={hand} value={hand}>{handName(hand)}</option>)}
          </select>
        </label>
        <label>
          Pot ($)
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={draft.pot}
            onChange={(event) => updateDraft({ pot: event.target.value })}
          />
        </label>
        <label>
          Played on
          <input
            type="datetime-local"
            value={toLocalDateTimeInput(draft.playedOn)}
            onChange={(event) => updateDraft({ playedOn: fromLocalDateTimeInput(event.target.value) })}
          />
        </label>
        <MemberChoices
          legend="Final Hand Opponents (optional)"
          members={opponentCandidates}
          checkedIds={draft.finalHandOpponentIds}
          onToggle={toggleOpponent}
        />
        <label>
          Note (optional)
          <textarea
            maxLength={MAX_NOTE_LENGTH}
            value={draft.note}
            onChange={(event) => updateDraft({ note: event.target.value })}
          />
        </label>
        <label>
          Photo (optional)
          <input
            type="file"
            accept={ACCEPTED_PHOTO_TYPES}
            onChange={(event) => updateDraft({ photo: event.target.files?.[0] ?? null })}
          />
        </label>
      </fieldset>
      <Problems messages={problems} />
      <FormActions phase={phase} onRetryPhoto={retryPhoto} onSkipPhoto={showLeaderboard} />
    </form>
  );
}

/** Members are fetched before the fields appear, so a Participant can't be missing from a half-loaded list. */
export function RecordTournamentForm() {
  const activeMembers = useActiveMembers();

  if (activeMembers.status === 'loading') return <p>Loading the Members…</p>;
  if (activeMembers.status === 'failed') return <p role="alert">{MEMBERS_FAILED_MESSAGE}</p>;

  return <RecordTournamentFields members={activeMembers.members} />;
}
