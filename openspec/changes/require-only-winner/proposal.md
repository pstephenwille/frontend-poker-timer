# Proposal

## Why

Recording a Tournament today needs at least two checked Participants, with the Winner among them. The group cares above all about the Winner (Decision 37), and the other checkboxes are bookkeeping that a host may not know or may not bother with at the end of a night. Requiring two Participants makes the host tick boxes that change nothing on the Leaderboard's ranking, which counts wins alone.

Noted on 2026-11-25 (session 7) as future work. Not yet designed.

## What Changes

- Recording a Tournament needs only its Winner. Every other Participant becomes optional.
- **Backend:** the contracts' `MIN_PARTICIPANTS` (`packages/contracts/src/tournament.ts`) and the rule that the Winner is among the Participants are revisited, with the `tournament-records` spec in `add-mvp-backend` and their tests, then a contracts release. Loosening a rule is a minor version under the backend's semantic-versioning rule (major only for removed, renamed or tightened fields).
- **Frontend:** the "Check at least two Participants." rule in `src/tournaments/tournament-draft.ts` goes, and the Winner choices no longer come only from the checked Participants.
- This reopens **Decision 37**, which kept the two-Participant minimum because the backend required it and the Leaderboard's Played and Win rate columns count Participants.

## Capabilities

### New Capabilities

- `tournament-recording`: what the Record form requires before it saves a Tournament.

### Modified Capabilities

- None in this repo. The backend's `tournament-records` capability changes in `../backend-poker-timer`.

## Impact

- Backend: contracts, `POST` and `PATCH /api/tournaments` validation, the `tournament-records` spec, a contracts release.
- Frontend: the Record form's rules and Winner choices, and the contracts dependency.
- Leaderboard: Played and Win rate depend on how the open questions in `design.md` are answered.
