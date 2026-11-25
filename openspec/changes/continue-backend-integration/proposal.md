# Proposal

## Why

The frontend has its first three slices of the backend integration built, merged and checked on `dev`: the read-only Leaderboard, sign-in and sign-out, and recording a Tournament (Decision 1). What remains is putting it on `prod`, where the backend's last open check (task 14.3 of `add-mvp-backend`) runs through the real UI, and the two parts not yet designed: slice 4 (profile and avatar) and the admin UI.

`docs/handoff-backend-integration.md` holds the design so far, as Decisions 1–41. This change carries the remaining work, and `handoff.md` beside it says where everything stands, for picking up on another machine.

## What Changes

- Deploy the frontend to `prod` and run backend task 14.3 through it.
- Design and build slice 4: what `/me` holds (it is a placeholder today, Decision 41), the avatar, and Me in the account menu (Decision 33).
- Design and build the admin UI, which Decision 1 left out for now.
- Close the loose ends from slices 2 and 3 (see `tasks.md`).

## Capabilities

### New Capabilities

- `account-menu`: what the signed-in Member's menu in the header offers.
- `member-profile`: what `/me` shows and lets the Member change (Decisions 42–45).

The admin UI's capabilities are added here once it is designed.

## Impact

- `prod` serves the frontend for the first time, replacing SST's placeholder page.
- Slice 4 uses the backend's existing `/api/me`, avatar and member routes, plus one backend change: `Me` gains `avatarStatus`, released as contracts 1.2.0 (Decision 43).
