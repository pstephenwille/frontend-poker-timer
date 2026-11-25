## 1. Design

- [ ] 1.1 Settle the open questions in `design.md` one at a time, each with a recommended answer, recording each as a numbered Decision in `docs/handoff-backend-integration.md` (from 42) and any new term in `GLOSSARY.md`; then update this change's spec delta and tasks to match; verify `openspec validate require-only-winner --strict` passes

## 2. Backend (in ../backend-poker-timer, needs a contracts release)

- [ ] 2.1 Loosen the contracts' participant rules as decided (likely `MIN_PARTICIPANTS` from 2 to 1, keeping the Winner among the Participants), update the `tournament-records` spec in `add-mvp-backend` with a new task, and release a minor contracts version; verify unit tests for the cross-field rules, integration tests for `POST` and `PATCH` with only the Winner, `openspec validate add-mvp-backend --strict`, and that the release is on GitHub Packages

## 3. Frontend (needs the release from 2.1)

- [ ] 3.1 Move to the new contracts version and change the Record form as decided: drop "Check at least two Participants.", offer the Winner as decided, and keep Final Hand Opponents valid; verify app-level tests that a Tournament with only a Winner saves with the expected `CreateTournament` body
- [ ] 3.2 If decided, change how the Leaderboard presents Played and Win rate; verify app-level tests for the Leaderboard page

## 4. Release

- [ ] 4.1 Deploy the frontend to `dev` and record a Tournament with only a Winner; verify it saves and the Leaderboard and both honor cards show it, then deploy to `prod`
