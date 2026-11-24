# Handoff: building the frontend on the backend

Status as of 2026-11-24. This is a design (grilling) session that is still in progress, run with the `grill-with-docs` skill. No code has changed yet. Decisions made so far are recorded here. Terms that are settled are in `GLOSSARY.md`.

To resume, run `/mattpocock-skills:grill-with-docs`, point it at this file, and continue from **Open question** below. Questions are asked one at a time.

## Goal

Build the UI for the backend in `../backend-poker-timer`. It provides Google sign-in, tournament records, profiles with avatars, photo uploads and a leaderboard. Its spec is `openspec/changes/add-mvp-backend/`, and `handoff.md` there gives its deployed stages. The backend's last open check, task 14.3, needs this UI. That check is: sign in on `prod`, record a tournament with a photo, then sign out and read the leaderboard while signed out.

## Backend facts that shape the UI

- The leaderboard (`GET /api/leaderboard`) is public, needs no sign-in, and is recomputed on each read. Each entry has: rank, display name, avatar URL, wins, tournaments played, win rate, total winnings and latest winning hand. Ties share a rank, and everyone with 0 wins shares the last rank.
- Tournament routes appear to need a session (`requireSession` in `packages/api/src/app.ts`). Tournament photos are private, served through signed URLs that expire within an hour.
- Keeping the timer in sync with the backend is out of scope for the backend's MVP. A tournament is recorded after it ends, so the leaderboard doesn't change during a game.
- Guests (players without accounts) can't be recorded, and the Winner must be a member.

## Decisions

1. **Scope, in vertical slices:** (1) read-only leaderboard, public with no auth; (2) sign-in and sign-out; (3) recording a tournament, with photo; (4) profile and avatar. The admin UI is out for now.
2. **The main screen honours the Reigning Champion:** the Winner of the most recent Tournament, with avatar, name, winning hand and date, shown throughout the game as a single card. It is not a top-3 list, not the all-time leader, and not both.
3. **UX direction (agreed in principle, placement not final):**
   - Upcoming Blinds stays on the main screen during play.
   - The full leaderboard goes on its own page (for example `/leaderboard`), linked from the header.
   - No fixed column down the side and no carousel that rotates by itself.
   - Candidate spot for the champion card: the empty bottom-left area beside the Upcoming Blinds panel.
4. **Vocabulary:** a Tournament is a sequence of Hands, and each Hand has four Betting Rounds. "Round" on its own is retired. The domain language in **both** the frontend and the backend code is to be corrected to match `GLOSSARY.md`.

## Open question (resume here)

**Q4: When do the blinds go up?** Proposed definition of **Level**: "a timed period at a fixed small and big blind, where each Hand is played at the Level in effect when it was dealt". Levels go up by the clock, not by counting Hands. The user had said "blinds have levels and increase per hand", but the app's levels are time-based. That needs settling.

## Remaining questions

These are roughly in dependency order:

- **Reigning Champion data while signed out.** The leaderboard has no win dates, so it can't name the most recent Winner. Tournaments and photos need a session. Options: the timer screen is signed in as the host; or a new public backend endpoint for the Reigning Champion, using the avatar rather than the private tournament photo.
- **"Pot" naming.** The backend uses `pot` for prize money (whole dollars), which collides with the chips bet in a Hand. Pick a term such as Prize, Purse or Winnings and rename it in both repos.
- **Backend "final-round opponents"** (`opponentIds`): rename to the players in the final Hand.
- **Champion card placement and content.** Where it sits, what it shows (avatar vs tournament photo, hand, date, pot?), and what shows when no tournament has been recorded yet.
- **Starting Blind vs Starting Chips.** The engine action `setStartingChips` takes a small-blind value. Starting chips per player are not modelled.
- **Colour-up Break vs Break.** An automatic break follows any Level whose small blind is 25, except the opening one. Suspected bug: with Starting Blind 25 it never fires. Should the rule key off the chip denomination?
- **Game lifecycle states:** Not Started / Running / Paused / Level Transition / On Break. Currently a Break can start from Not Started, and then its clock doesn't tick. Does Pause during a Break pause the break clock?
- **Plan for renaming code in both repos:** order of work, and versioning of the contracts package (`@pstephenwille/poker-timer-contracts`).
