import { HAND_CATEGORIES, HandCategory, type MemberSummary } from '@pstephenwille/poker-timer-contracts';
import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { LEADERBOARD_PATH } from '../app-paths';
import { handName } from '../leaderboard/hand-names';
import { fromLocalDateTimeInput, initialPlayedOn, toLocalDateTimeInput } from './played-on';
import { draftProblems, toCreateTournament, type TournamentDraft } from './tournament-draft';
import { recordTournament, TournamentRefusedError } from './tournaments-api';
import { useActiveMembers } from './use-active-members';

const MEMBERS_FAILED_MESSAGE = "The Members couldn't be loaded. Reload the page to try again.";
const SAVE_FAILED_MESSAGE = "The Tournament couldn't be recorded. Try again.";
const HANDS_STRONGEST_FIRST = [...HAND_CATEGORIES].reverse();

function ParticipantChoices({ members, checkedIds, onToggle }: {
  members: MemberSummary[];
  checkedIds: string[];
  onToggle: (memberId: string) => void;
}) {
  return (
    <fieldset>
      <legend>Participants</legend>
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
  }));
  const [problems, setProblems] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const updateDraft = (changes: Partial<TournamentDraft>) => setDraft((current) => ({ ...current, ...changes }));
  const checkedParticipants = members.filter((member) => draft.participantIds.includes(member.id));

  const toggleParticipant = (memberId: string) => setDraft((current) => {
    const isUnchecking = current.participantIds.includes(memberId);
    if (!isUnchecking) return { ...current, participantIds: [...current.participantIds, memberId] };

    return {
      ...current,
      participantIds: current.participantIds.filter((id) => id !== memberId),
      winnerId: current.winnerId === memberId ? '' : current.winnerId,
    };
  });

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const draftIssues = draftProblems(draft, Date.now());
    setProblems(draftIssues);
    if (draftIssues.length > 0) return;

    setIsSaving(true);
    try {
      await recordTournament(toCreateTournament(draft));
      navigate(LEADERBOARD_PATH);
    } catch (error) {
      setProblems([saveFailureMessage(error)]);
      setIsSaving(false);
    }
  };

  return (
    <form aria-label="Record a Tournament" className="record-tournament-form" noValidate onSubmit={save}>
      <ParticipantChoices members={members} checkedIds={draft.participantIds} onToggle={toggleParticipant} />
      <label>
        Winner
        <select value={draft.winnerId} onChange={(event) => updateDraft({ winnerId: event.target.value })}>
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
      <Problems messages={problems} />
      <button type="submit" disabled={isSaving}>Save</button>
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
