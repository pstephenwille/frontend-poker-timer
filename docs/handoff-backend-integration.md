# Handoff: building the frontend on the backend

Status as of 2026-11-24, after the fourth grilling session. This was a design (grilling) session, now complete, run with the `grill-with-docs` skill. No code has changed yet. Decisions made so far are recorded here. Terms that are settled are in `GLOSSARY.md`.

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

23. **End Tournament hands off to recording (was Q2 of session 4):** once the Winner is known, a player presses **End Tournament** on the timer. It is enabled only once the Tournament has started (Running or Paused), and asks for confirmation because it can't be undone. Confirming Resets the timer to Not Started and opens the recording form, filled in with everything already known, including `playedOn` set to the moment the Tournament ended. The form also lives at `/tournaments/new`, linked from the header, so a Tournament can be recorded later. Leaving the form never touches the timer (amended by Q12 of session 4, so that recording a past Tournament mid-game can't wipe the running clock). Pause is unchanged: it stops the clock mid-game without touching the settings.

24. **Participants are picked on the form (was Q3 of session 4):** the form lists every Member of the group (`GET /api/members`; the backend has one group, which every account joins at first sign-in). The previous Tournament's Participants are ticked by default. The timer stays unaware of players, Members and the network. Deactivated Members (`active: false`) are left off the list (was Q4).

25. **Recording while signed out (was Q5 of session 4):** End Tournament works the same whether or not anyone is signed in. It opens `/tournaments/new?playedOn=<ms>`, which carries the known data in the URL. When signed out, the form shows "Sign in to record" in place of its fields; that goes through `/auth/login` with `returnTo` set to the same URL, so `playedOn` survives the trip to Google. The timer has already Reset by then.

26. **Pot is entered directly (was Q6 of session 4):** the form asks for the Pot in whole dollars, starting with the previous Tournament's Pot. Working the Pot out from a Buy-in and the Participants is a future feature.

27. **Form fields follow the contract (was Q7 of session 4):** Participants (Decision 24), a Winner chosen from the ticked Participants, a Winning Hand from the ten categories, the Pot (Decision 26), optional Final Hand Opponents chosen from the Participants other than the Winner, an optional Note of up to 500 characters, and an optional **photo** (a file input, so phones can take one with the camera). Save creates the Tournament first and then uploads the photo to it. If the upload fails, the Tournament stays recorded and the form says the photo didn't make it.

28. **After saving, show the Leaderboard (was Q8 of session 4):** a successful save goes to `/leaderboard` with the new Tournament's Winner highlighted. Going back to the timer (now Not Started) fetches the Leaderboard again for both cards, which extends Decision 20's "once per page load" to "once each time the timer screen is shown".

29. **A failed photo can be retried (was Q9 of session 4):** if the upload fails after the Tournament is saved, the form stays open with "Tournament recorded. The photo didn't upload." and two buttons: **Try again** (uploads the same file to the saved Tournament) and **Skip photo** (goes on to the Leaderboard). The other fields are locked, so the Tournament can't be recorded twice.

30. **Played on is editable (was Q10 of session 4):** the form always shows Played on as an editable date and time in the viewer's local time, pre-filled from the URL's `playedOn`, or with now when there is none. Times in the future are rejected with "Played on can't be in the future" (the backend allows 5 minutes of clock drift).

31. **The timer screen holds the table during play (was Q11 of session 4, reversed after Q13 and settled by Q14):** while the Level's clock is Running, or a Break is on (the Level's clock is stopped and the overlay covers the screen), every link away from the timer (header, champion cards) is disabled with the hint "Pause the game to leave the timer". From Not Started or Paused you can leave. A Paused Tournament survives moving between pages in the app, because the timer's state sits above the routes, and it is still Paused when you come back. Players who want the Leaderboard, Me or admin pages during a game open them on their own device. There is no mini clock in the header.
32. **No sign-in on the timer's device during a game (was Q13 of session 4):** "Sign in" is disabled from Start until the Tournament is ended or Reset (Running, Paused and On Break), because sign-in reloads the page and would lose the Tournament. Players can sign in on their own devices. Signing in on the timer's device after End Tournament goes through the form (Decision 25), when the timer is already Not Started.
33. **Register once; the host's device stays signed in (was Q15 of session 4):** a Member registers by signing in with Google once, usually on their own phone, which makes them a Member (no per-game sign-in; sessions last 30 days idle, 90 days at most). The timer's device is normally left signed in as the **host**, who records each Tournament and becomes its `recordedById`. Any Member can also record from their own device. Header: signed in, a small avatar with a menu holding **Me** and **Sign out** (sign-out doesn't reload the page); signed out, a quiet **Sign in** link (disabled during a game, Decision 32). "Sign in to record" (Decision 25) appears only when the host's session has expired.
34. **Registering at the table (was Q17 of session 4):** for a group whose players register on the night, the form (and its signed-out "Sign in to record" prompt) shows a "Not listed? Scan to register" QR code linking to sign-in, so players register on their own phones while the host signs in on the timer's device. The Participant list fetches again whenever the form's window regains focus and has a Refresh button, keeping ticked boxes and filled fields. A note under the list says players without an account can't be recorded (no Guests, and the Winner must be a Member).
35. **Sign-in failures (was Q16 of session 4):** a dismissible banner shows the message for the backend's `signinError` code, then the code and `ref` are removed from the URL. Messages: `cancelled` "Sign-in was cancelled."; `expired` "Sign-in took too long. Please try again."; `deactivated` "This account has been deactivated. Ask an admin to reactivate it."; `failed` "Sign-in failed. Please try again. (ref: <id>)". Only `failed` shows the `ref`. Sign-in from the register QR code (Decision 34) returns to `/me`.

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
- **End Tournament (new, Decision 23):** after a confirmation, Resets the timer and opens the recording form. There is no separate Ended state.
- **Reset:** returns to Not Started and restores the default Level and Break lengths. The Starting Blind's schedule is kept.
- **After the last Level:** the last Level's blinds (500/1000) repeat, the Level number keeps rising, and each change is still celebrated.
- **Changing the Level length in Settings mid-game** restarts the current Level's clock at the new length.

These are UI states, not domain terms, so they stay out of `GLOSSARY.md`.

## Status

Session 4 (2026-11-24) designed slices 2 and 3, sign-in and recording a Tournament (Decisions 23–35). Slice 4, profile and avatar (including the `/me` page's contents), and the admin UI remain undesigned. Next step is implementation, starting with step 1 of Decision 21.
