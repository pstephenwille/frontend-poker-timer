# Design

## Context

Decisions 1–41 in `docs/handoff-backend-integration.md` settle slices 1–3, the navigation rules during play (Decisions 31 and 32) and the account menu (Decision 33). The backend already serves what slice 4 needs: `GET /api/me`, the avatar upload grant and confirm under `/api/me/avatar`, `GET /api/members/{id}` with derived stats, and an optional unique username.

## Decisions already made

- **Me in the account menu (Decision 33):** signed in, the header's avatar opens a menu holding **Me** and **Sign out**. Only Sign out exists so far.
- **Leaving the timer during play (Decision 31):** every link away from the timer is disabled while the Level's clock is Running or a Break is on, with the hint "Pause the game to leave the timer". Me follows the same rule.
- **`/me` is a placeholder (Decision 41)** that slice 4 replaces.

## Open questions for slice 4

Settle these one at a time, each with a recommended answer, and record each as a numbered Decision (the next free number is 42). Session 5 opened slice 4 but skipped its first question. Session 8 settled all four, as Decisions 42–45, and the `member-profile` spec holds them.

1. ~~What does `/me` hold?~~ Settled by Decision 42: avatar, display name, username and `MemberProfile` stats, without recent Tournaments.
2. ~~How is the avatar changed?~~ Settled by Decision 43: a file input with the photo's checks, uploading at once, and a backend change adding `avatarStatus` to `Me` (contracts 1.2.0).
3. ~~Can a Member set or change their username there?~~ Settled by Decision 44: a Username field with Save and Clear, checked with the contracts' `Username` schema, and "That username is taken." on 409.
4. ~~Can other Members' profiles be opened?~~ Settled by Decision 45: not in slice 4; Leaderboard rows stay unlinked.

## Open questions for the admin UI

Designed after slice 4. The backend's admin routes cover deactivating and reactivating accounts; what the admin UI offers beyond that is open.

## Risks

- The first `prod` deploy replaces SST's placeholder `index.html` with the app. As on `dev`, find the bucket by name, since the router's origin is `placeholder.sst.dev`.
- Backend task 14.3 needs two Google accounts, since a Tournament needs two Members until `require-only-winner` lands.
