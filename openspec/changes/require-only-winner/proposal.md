# Proposal

## Why

Recording a Tournament today needs at least two checked Participants, with the Winner among them. The group cares above all about the Winner (Decision 37), and the other checkboxes are bookkeeping that a host may not know or may not bother with at the end of a night. Requiring two Participants makes the host tick boxes that change nothing on the Leaderboard's ranking, which counts wins alone.

Noted on 2026-11-25 (session 7) as future work, and designed in session 9 (Decisions 46–49).

## What Changes

- Recording a Tournament needs only its Winner. Every other Participant becomes optional, and the Winner is always one of the Participants (Decision 46).
- **Backend:** the contracts' `MIN_PARTICIPANTS` (`packages/contracts/src/tournament.ts`) drops from 2 to 1, keeping the rule that the Winner is among the Participants, with the `tournament-records` spec in `add-mvp-backend` and their tests, then a contracts release. Loosening a rule is a minor version under the backend's semantic-versioning rule (major only for removed, renamed or tightened fields).
- **Frontend:** the "Check at least two Participants." rule in `src/tournaments/tournament-draft.ts` goes. The Winner is chosen from every active Member (Decision 47), and Final Hand Opponents from every active Member except the Winner (Decision 49); choosing either checks that Member as a Participant. The Leaderboard says that Played counts checked Participants (Decision 48).
- This reopens **Decision 37**: Decision 46 replaces its two-Participant minimum, and Decision 48 its reason for keeping the checkboxes.

## Capabilities

### New Capabilities

- `tournament-recording`: what the Record form requires before it saves a Tournament, and how it offers the Winner and Final Hand Opponents.

### Modified Capabilities

- None in this repo. The backend's `tournament-records` capability changes in `../backend-poker-timer`.

## Impact

- Backend: contracts, `POST` and `PATCH /api/tournaments` validation, the `tournament-records` spec, a contracts release.
- Frontend: the Record form's rules, its Winner and Final Hand Opponent choices, and the contracts dependency.
- Leaderboard: a note that Played counts checked Participants. Played and Win rate keep their meaning but read high when hosts record only the Winner.
