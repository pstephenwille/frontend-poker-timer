# Design

Designed in session 9. Each decision is recorded in full in `docs/handoff-backend-integration.md`.

## Context

- A Tournament today: `participantIds` holds at least `MIN_PARTICIPANTS` (2) distinct Members, `winnerId` is one of them, and `finalHandOpponentIds` are Participants other than the Winner. All three are cross-field rules in the contracts' `TournamentDetails`, enforced on `POST` and `PATCH`.
- Every Member stat (Played, wins, Win rate, winnings, latest Winning Hand, wins by Winning Hand) is read from the `tournament_participants` rows. A row counts as a win when the Tournament's `winnerId` is that Member. Final Hand Opponents are a flag on those rows.
- The Leaderboard ranks by wins alone. Its Played and Win rate columns count the Tournaments a Member was checked as a Participant in.
- The form lists the active Members as unchecked Participants (Decision 38) and offers only the checked ones as Winner and as Final Hand Opponents.

## Decisions

- **Decision 46: the Winner is always a Participant.** `MIN_PARTICIPANTS` drops to 1 and the Winner stays among the Participants, so a Tournament with only a Winner sends `participantIds: [winnerId]`. Rejected: a Winner outside `participantIds`, which would lose the win from every stat.
- **Decision 47: the Winner is chosen from every active Member.** Choosing one checks them as a Participant and locks that checkbox while they are the Winner; changing the Winner leaves the previous one checked. Rejected: "check first, then choose".
- **Decision 48: Played and Win rate count checked Participants.** Both columns stay, with a Leaderboard note that Played counts the Tournaments a Member was checked in. Ease of use comes before precision. Rejected: hiding or dropping the columns.
- **Decision 49: Final Hand Opponents stay optional.** The host picks each one from every active Member except the Winner, and picking one checks them as a Participant and locks that checkbox. Rejected: requiring at least one.

## Risks

- Played and Win rate read high when hosts stop checking Participants. Decision 48 accepts that for easier recording.
- Changing the contracts needs the backend and frontend released in order: the backend and contracts first, then the frontend on the new contracts version.
