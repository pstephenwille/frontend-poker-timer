# Handoff: building the frontend on the backend

Status as of 2026-11-24, after the third grilling session. This was a design (grilling) session, now complete, run with the `grill-with-docs` skill. No code has changed yet. Decisions made so far are recorded here. Terms that are settled are in `GLOSSARY.md`.

To reopen the design, run `/mattpocock-skills:grill-with-docs` and point it at this file. Ask questions **one at a time**, each with a recommended answer, and record each answer here and in `GLOSSARY.md` as soon as it is given. The backend repo (`../backend-poker-timer`) is read only for facts; this repo is where the design lives.

## Goal

Build the UI for the backend in `../backend-poker-timer`. It provides Google sign-in, tournament records, profiles with avatars, photo uploads and a leaderboard. Its spec is `openspec/changes/add-mvp-backend/`, and `handoff.md` there gives its deployed stages. The backend's last open check, task 14.3, needs this UI. That check is: sign in on `prod`, record a tournament with a photo, then sign out and read the leaderboard while signed out.

## Backend facts that shape the UI

- The leaderboard (`GET /api/leaderboard`) is public, needs no sign-in, and is recomputed on each read. Each entry has: rank, display name, avatar URL, wins, tournaments played, win rate, total winnings and latest winning hand. Ties share a rank, and everyone with 0 wins shares the last rank (to change: Decisions 17 and 18).
- Tournament routes appear to need a session (`requireSession` in `packages/api/src/app.ts`). Tournament photos are private, served through signed URLs that expire within an hour.
- Keeping the timer in sync with the backend is out of scope for the backend's MVP. A tournament is recorded after it ends, so the leaderboard doesn't change during a game.
- Guests (players without accounts) can't be recorded, and the Winner must be a member.
- Contract timestamps (`playedOn`, `createdAt`, `updatedAt`) are whole epoch milliseconds, UTC instants with no offset; the database stores them as millisecond `timestamptz`. Tournament recency is ordered by `playedOn`, then `createdAt`, then `id`.

## Decisions

1. **Scope, in vertical slices:** (1) read-only leaderboard, public with no auth; (2) sign-in and sign-out; (3) recording a tournament, with photo; (4) profile and avatar. The admin UI is out for now.
2. **(Superseded by Decisions 15–19.) The main screen honours the Reigning Champion:** the Winner of the most recent Tournament, with avatar, name, winning hand and date, shown throughout the game as a single card. It is not a top-3 list, not the all-time leader, and not both.
3. **UX direction (agreed in principle, placement not final):**
   - Upcoming Blinds stays on the main screen during play.
   - The full leaderboard goes on its own page (for example `/leaderboard`), linked from the header.
   - No fixed column down the side and no carousel that rotates by itself.
   - Card placement is settled by Decisions 15 and 19.
4. **Vocabulary:** a Tournament is a sequence of Hands, and each Hand has four Betting Rounds. "Round" on its own is retired. The domain language in **both** the frontend and the backend code is to be corrected to match `GLOSSARY.md`.
5. **Level (was Q4):** a Level is the timed stage with fixed blinds; the blinds go up when its clock runs out. A Hand is one deal, and a Betting Round is a stage within a Hand. The UI's "Round" (`currentRound`, "Round time", "Round: N") becomes Level.
6. **Final Hand and Winning Hand:** only the Final Hand is recorded; the Winning Hand is the Winner's five-card category in it.
7. **Final Hand Opponents:** the backend's `opponentIds` ("final-round opponents") becomes `finalHandOpponentIds`, still optional. The backend's domain language (specs, code, contracts) must be updated to match.
8. **Color-up Break:** fires after the Level whose small blind is 15, never when that is the opening Level (replaces the current 25 rule in `round-timer.tsx`). So a Starting Blind of 15 or higher gets no color-up.
9. **Last Winner source:** add `lastWonAt` to each public leaderboard entry; the client picks the entry with the latest `lastWonAt` and shows its avatar, name, `latestWinningHand` and date. No sign-in, no new endpoint. `lastWonAt` is the `playedOn` of the member's latest win: epoch milliseconds (a UTC instant, like every contract timestamp), `null` for members with no wins, and displayed as a date in the viewer's local time. This is a minor (additive) contracts version bump.
10. **Pot stays Pot:** the Pot is all the money in the Tournament (every player's Buy-in), all on the table by the Final Hand, and the Winner takes all of it. The backend's `pot` is correct and is not renamed.
11. **Starting Blind:** rename the engine action `setStartingChips` to `setStartingBlind`. Players' starting chip stacks stay unmodelled.
12. **Breaks can't be paused (was Q7):** a Break runs for its set length and can only be ended early by hand. This keeps today's behaviour on purpose: the overlay covers the Pause button, Space is ignored while it is open, and a click anywhere or Escape ends the Break.
13. **Breaks only once started (was Q8):** a Break can start only after the Tournament has started; "Take Break" is disabled while Not Started. A pre-game countdown, if ever wanted, is a separate concept with its own name.
14. **Ending a Break resumes play (was Q9):** when a Break ends, by its horn or by hand, the Level's clock always runs again, even if it was paused before the Break. The table pauses again if it isn't ready. (This is today's behaviour, kept on purpose.)
15. **Champion card placement (was Q10):** bottom left, beside Upcoming Blinds, shown from Not Started through play (under the Break overlay like everything else). It honours one single win, the most recent Tournament's, and is separate from the leaderboard of most wins. It shows the **Last Winner**.
16. **Two honours, two terms (was Q11):** the **Last Winner** is the Winner of the most recent Tournament (one win, Decision 9's `lastWonAt`). The **Reigning Champion** is the member ranked first on the Leaderboard. Both appear on the main screen, which replaces Decision 2's "one card, not both". Placement: Decisions 15 and 19.
17. **Ties for first go to the most recent winner (was Q12):** when members tie on the Leaderboard (same win count, same Winning Hands newest first), the one whose latest win is most recent ranks above the others and is the Reigning Champion. In six Tournaments alternating Alice, Bob, Alice, Bob, Alice, Bob with identical hands, Bob is champion after T6. This replaces the backend's display-name tiebreak.
18. **Distinct ranks (was Q13):** every member with a win has their own rank number (1 Bob, 2 Alice, not 1, 1). Only members with no wins share the last rank. Backend change: drop shared ranks for members with wins.
19. **Reigning Champion card placement (was Q14):** bottom right, mirroring the Last Winner card across Upcoming Blinds. It shows avatar, name and win count, and links to `/leaderboard`. Both cards show even when the same member holds both honours.
20. **Empty and offline cards (was Q15):** with no recorded wins, both cards show "No winner yet". If the Leaderboard can't be fetched, both cards are hidden, the error is logged to the console, and the timer is unaffected. The Leaderboard is fetched once per page load, with no polling.
21. **Order of work (was Q16):** (1) a frontend-only refactor PR: Round → Level throughout (`currentRound`, `ROUND_TIMES`, `round-timer.tsx`, `round-settings.tsx`, "Round time", "Round: N", "N min Round"), `setStartingChips` → `setStartingBlind`, the Color-up Break after the 15 blind, and "Take Break" disabled until Start; (2) one backend contracts **major** release (`@pstephenwille/poker-timer-contracts`) carrying `finalHandOpponentIds`, `lastWonAt`, the most-recent-win tiebreak and distinct ranks, together with the backend's terminology fixes: "final-round opponents" → Final Hand Opponents (`packages/contracts/src/tournament.ts`, `fixtures.ts`, `tournament-store.ts`, `tournament-routes.ts`, `db/schema.ts`, and the openspec proposal, design, tasks and `tournament-records` spec), the spec scenario "knocked out in the final round" → "in the Final Hand", and "round-by-round history" in the proposal → "hand-by-hand history"; (3) the frontend slices from Decision 1, built on that release.
22. **Rename the database column too (was Q17):** the `opponentIds` column (`packages/api/src/db/schema.ts`, created in `drizzle/0002_tournaments.sql`) is renamed to match `finalHandOpponentIds` by a migration in the same contracts major release, so the old name doesn't remain in the database. Write an ADR in the backend repo when doing it (hard to reverse on `prod`, and a real trade-off against mapping the old name in code).

## Frontend renames (step 1 of Decision 21)

Files: `round-timer.tsx` → `level-timer.tsx`, `round-settings.tsx` → `level-settings.tsx`.

| Now | Becomes | Where |
|---|---|---|
| `RoundTimer` | `LevelTimer` | `round-timer.tsx`, `main-display.tsx` |
| `RoundSettings` | `LevelSettings` | `round-settings.tsx`, `header.tsx` |
| `currentRound` | `currentLevel` | `game-engine.ts`, `round-timer.tsx`, `blinds-schedule.tsx` |
| `incrementCurrentRound` | `incrementCurrentLevel` | `game-engine.ts`, `round-timer.tsx` |
| `roundCount` (reducer arg) | `levelCount` | `game-engine.ts` |
| `roundDurationSeconds` / `setRoundDurationSeconds` | `levelDurationSeconds` / `setLevelDurationSeconds` | `game-engine.ts`, `main-display.tsx`, `round-timer.tsx`, `round-settings.tsx`, `blinds-schedule.tsx` |
| `DEFAULT_ROUND_SECONDS` | `DEFAULT_LEVEL_SECONDS` | `utils.ts`, `game-engine.ts` |
| `ROUND_TIMES` | `LEVEL_TIMES` | `utils.ts`, `round-settings.tsx` |
| `roundEndAudioRef` | `levelEndAudioRef` | `game-engine.ts`, `game-engine-context.tsx`, `round-timer.tsx` |
| `setStartingChips(chips)` | `setStartingBlind(startingBlind)` | `game-engine.ts`, `round-settings.tsx` |
| `setRoundTime` | `setLevelTime` | `round-settings.tsx` |
| `getBlindForRound(blinds, round)` | `getBlindForLevel(blinds, level)` | `round-timer.tsx` |
| `isColorUpDue(completedRound, …)` | `isColorUpBreakDue(completedLevel, …)` | `round-timer.tsx` |
| `isOpeningRound` | `isOpeningLevel` | `round-timer.tsx` |
| `completedRound` | `completedLevel` | `round-timer.tsx` |
| `celebrateRoundEnd` | `celebrateLevelEnd` | `round-timer.tsx` |
| `advanceToNextRound` | `advanceToNextLevel` | `round-timer.tsx` |
| `PAUSE_BETWEEN_ROUNDS_MILLIS` | `PAUSE_BETWEEN_LEVELS_MILLIS` | `round-timer.tsx` |
| `isPausedBetweenRounds` | `isPausedBetweenLevels` | `round-timer.tsx` |
| `advanceAfterPauseBetweenRounds` | `advanceAfterPauseBetweenLevels` | `round-timer.tsx` |
| `pauseBetweenRounds` (also used after the Break horn) | `runAfterDelay` | `utils.ts`, `round-timer.tsx`, `break-timer.tsx` |
| `keepRoundClockPausedForWholeBreak` | `keepLevelClockPausedForWholeBreak` | `break-timer.tsx` |
| `SMALL_BLIND_THAT_RETIRES_LOWEST_CHIPS = 25` | same name, value `15` (Decision 8) | `round-timer.tsx` |

On screen: "Round: N" → "Level: N"; "Round time" → "Level time"; "N min Round" → "N min Level".

Unchanged: `roundUpToWholeSeconds` in `use-countdown.ts` (arithmetic rounding, not a poker Round).

## Game lifecycle (as the code behaves, not up for change)

- **Not Started:** Start begins the Tournament and runs the first Level. "Take Break" is disabled (Decision 13).
- **Running:** the Level's clock counts down. Pause (button or Space) stops it.
- **Paused:** Start or Space resumes the Level's clock where it stopped.
- **Level change:** when the clock reaches 0, confetti and the jackpot sound play, and after 3 seconds the next Level starts running. If the Color-up Break is due, it starts then. Pausing during those 3 seconds cancels them, and resuming starts them over.
- **On Break:** the Level's clock is stopped and the break clock counts down. At 0 the horn sounds and play resumes 1.5 seconds later. A click or Escape ends the Break early (Decisions 12 and 14).
- **Reset:** returns to Not Started and restores the default Level and Break lengths. The Starting Blind's schedule is kept.
- **After the last Level:** the last Level's blinds (500/1000) repeat, the Level number keeps rising, and each change is still celebrated.
- **Changing the Level length in Settings mid-game** restarts the current Level's clock at the new length.

These are UI states, not domain terms, so they stay out of `GLOSSARY.md`.

## Status

The grilling session is complete: no open questions remain. Next step is implementation, starting with step 1 of Decision 21.
