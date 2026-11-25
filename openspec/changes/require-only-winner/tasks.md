## 1. Design

- [x] 1.1 Settle the open questions in `design.md` one at a time, each with a recommended answer, recording each as a numbered Decision in `docs/handoff-backend-integration.md` (Decisions 46–49) and any new term in `GLOSSARY.md`; then update this change's spec delta and tasks to match; verify `openspec validate require-only-winner --strict` passes

## 2. Backend (in ../backend-poker-timer, needs a contracts release)

- [ ] 2.1 Drop the contracts' `MIN_PARTICIPANTS` from 2 to 1, keeping the Winner among the Participants (Decision 46), update the `tournament-records` spec in `add-mvp-backend` with a new task, and release the next minor contracts version after 1.1.0; verify unit tests for the cross-field rules, integration tests for `POST` and `PATCH` with only the Winner, `openspec validate add-mvp-backend --strict`, and that the release is on GitHub Packages

## 3. Frontend (needs the release from 2.1)

- [ ] 3.1 Move to the new contracts version and change the Record form: drop "Check at least two Participants.", offer every active Member as the Winner and every active Member except the Winner as a Final Hand Opponent, and check and lock the Participant checkbox of the Winner and of each marked opponent (Decisions 47 and 49); verify app-level tests for every scenario in the `tournament-recording` spec, including that a Tournament with only a Winner saves with the expected `CreateTournament` body
- [ ] 3.2 Add the Leaderboard note that Played counts the Tournaments a Member was checked in (Decision 48); verify an app-level test for the Leaderboard page

## 4. Release

- [ ] 4.1 Deploy the frontend to `dev` and record a Tournament with only a Winner; verify it saves and the Leaderboard and both honor cards show it, then deploy to `prod`
