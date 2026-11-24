# Handoff: building the frontend on the backend

Status as of 2026-11-24, after the second grilling session. This is a design (grilling) session that is still in progress, run with the `grill-with-docs` skill. No code has changed yet. Decisions made so far are recorded here. Terms that are settled are in `GLOSSARY.md`.

To resume, run `/mattpocock-skills:grill-with-docs`, point it at this file, and continue from **Open question** below. Ask questions **one at a time**, each with a recommended answer, and record each answer here and in `GLOSSARY.md` as soon as it is given. The backend repo (`../backend-poker-timer`) is read only for facts; this repo is where the design lives.

## Goal

Build the UI for the backend in `../backend-poker-timer`. It provides Google sign-in, tournament records, profiles with avatars, photo uploads and a leaderboard. Its spec is `openspec/changes/add-mvp-backend/`, and `handoff.md` there gives its deployed stages. The backend's last open check, task 14.3, needs this UI. That check is: sign in on `prod`, record a tournament with a photo, then sign out and read the leaderboard while signed out.

## Backend facts that shape the UI

- The leaderboard (`GET /api/leaderboard`) is public, needs no sign-in, and is recomputed on each read. Each entry has: rank, display name, avatar URL, wins, tournaments played, win rate, total winnings and latest winning hand. Ties share a rank, and everyone with 0 wins shares the last rank.
- Tournament routes appear to need a session (`requireSession` in `packages/api/src/app.ts`). Tournament photos are private, served through signed URLs that expire within an hour.
- Keeping the timer in sync with the backend is out of scope for the backend's MVP. A tournament is recorded after it ends, so the leaderboard doesn't change during a game.
- Guests (players without accounts) can't be recorded, and the Winner must be a member.
- Contract timestamps (`playedOn`, `createdAt`, `updatedAt`) are whole epoch milliseconds, UTC instants with no offset; the database stores them as millisecond `timestamptz`. Tournament recency is ordered by `playedOn`, then `createdAt`, then `id`.

## Decisions

1. **Scope, in vertical slices:** (1) read-only leaderboard, public with no auth; (2) sign-in and sign-out; (3) recording a tournament, with photo; (4) profile and avatar. The admin UI is out for now.
2. **The main screen honours the Reigning Champion:** the Winner of the most recent Tournament, with avatar, name, winning hand and date, shown throughout the game as a single card. It is not a top-3 list, not the all-time leader, and not both.
3. **UX direction (agreed in principle, placement not final):**
   - Upcoming Blinds stays on the main screen during play.
   - The full leaderboard goes on its own page (for example `/leaderboard`), linked from the header.
   - No fixed column down the side and no carousel that rotates by itself.
   - Candidate spot for the champion card: the empty bottom-left area beside the Upcoming Blinds panel.
4. **Vocabulary:** a Tournament is a sequence of Hands, and each Hand has four Betting Rounds. "Round" on its own is retired. The domain language in **both** the frontend and the backend code is to be corrected to match `GLOSSARY.md`.
5. **Level (was Q4):** a Level is the timed stage with fixed blinds; the blinds go up when its clock runs out. A Hand is one deal, and a Betting Round is a stage within a Hand. The UI's "Round" (`currentRound`, "Round time", "Round: N") becomes Level.
6. **Final Hand and Winning Hand:** only the Final Hand is recorded; the Winning Hand is the Winner's five-card category in it.
7. **Final Hand Opponents:** the backend's `opponentIds` ("final-round opponents") becomes `finalHandOpponentIds`, still optional. The backend's domain language (specs, code, contracts) must be updated to match.
8. **Colour-up Break:** fires after the Level whose small blind is 15, never when that is the opening Level (replaces the current 25 rule in `round-timer.tsx`). So a Starting Blind of 15 or higher gets no colour-up.
9. **Reigning Champion source:** add `lastWonAt` to each public leaderboard entry; the client picks the entry with the latest `lastWonAt` and shows its avatar, name, `latestWinningHand` and date. No sign-in, no new endpoint. `lastWonAt` is the `playedOn` of the member's latest win: epoch milliseconds (a UTC instant, like every contract timestamp), `null` for members with no wins, and displayed as a date in the viewer's local time. This is a minor (additive) contracts version bump.
10. **Pot stays Pot:** the Pot is all the money in the Tournament (every player's Buy-in), all on the table by the Final Hand, and the Winner takes all of it. The backend's `pot` is correct and is not renamed.
11. **Starting Blind:** rename the engine action `setStartingChips` to `setStartingBlind`. Players' starting chip stacks stay unmodelled.

## Open question (resume here)

**Q7: Does Pause during a Break freeze the break clock?** Today the break clock runs whenever the Tournament has started and ignores Pause (`src/components/break-timer.tsx:16`), so pausing mid-Break (a player steps out for a call) keeps counting down. Recommended: yes, one Pause always stops whichever clock is showing.

## Remaining questions

These are roughly in dependency order:

- **Breaks before the game starts.** A Break can currently start from Not Started, and then its clock never ticks. Recommended: a Break is possible only once the Tournament has started.
- **Rest of the game lifecycle:** Not Started / Running / Paused / Level Transition / On Break. Name the states and their transitions, and decide which belong in `GLOSSARY.md`.
- **Champion card placement and empty state.** Content is settled by Decision 9 (avatar, name, Winning Hand, date). Still open: where it sits (candidate: bottom-left beside Upcoming Blinds), and what shows before any Tournament is recorded. The leaderboard carries only total winnings, so the card cannot show that Tournament's Pot unless the contract grows.
- **Plan for renaming code in both repos:** order of work, and versioning of the contracts package (`@pstephenwille/poker-timer-contracts`). Renaming `opponentIds` to `finalHandOpponentIds` is a breaking (major) bump; adding `lastWonAt` is minor. Frontend renames: Round → Level throughout (`currentRound`, `ROUND_TIMES`, `round-timer.tsx`, `round-settings.tsx`, "Round time", "Round: N"), `setStartingChips` → `setStartingBlind`, and the Colour-up Break rule.
