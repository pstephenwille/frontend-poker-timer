# Design

Not yet designed. Settle the open questions below one at a time, each with a recommended answer, and record every answer as a numbered Decision in `docs/handoff-backend-integration.md` (the next free number is 42) before building.

## Context

- A Tournament today: `participantIds` holds at least `MIN_PARTICIPANTS` (2) distinct Members, `winnerId` is one of them, and `finalHandOpponentIds` are Participants other than the Winner. All three are cross-field rules in the contracts' `TournamentDetails`, enforced on `POST` and `PATCH`.
- The Leaderboard ranks by wins alone. Its Played and Win rate columns count the Tournaments a Member was checked as a Participant in.
- The form lists the active Members as unchecked Participants (Decision 38) and offers only the checked ones as Winner and as Final Hand Opponents.

## Open questions

1. **Is the Winner always counted as a Participant?** Recommended: yes, implicitly. The backend keeps "the Winner is a Participant", and `MIN_PARTICIPANTS` drops to 1, so a Winner's Played count always includes their wins and Win rate never exceeds 100%. The alternative, a Winner outside `participantIds`, would let Win rate pass 100%.
2. **How does the form offer the Winner?** Recommended: choose the Winner from every active Member, and checking them as a Participant follows automatically. The alternative keeps "check first, then choose".
3. **What do Played and Win rate mean once checking others is optional?** Recommended: keep both columns, counting only checked Participants, and say on the Leaderboard that they count recorded Participants. The alternatives are hiding them, or dropping them (rejected once already in Decision 37).
4. **Do Final Hand Opponents still have to be checked Participants?** Recommended: yes, unchanged, so naming an opponent also counts them as having played.

## Risks

- Played and Win rate drift further from reality when hosts stop checking Participants. Question 3 decides whether that is acceptable.
- Changing the contracts needs the backend and frontend released in order: the backend and contracts first, then the frontend on the new contracts version.
