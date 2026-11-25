# Handoff: building the frontend on the backend

Status as of 2026-11-24, after session 5. Slices 1 and 2 are built and merged, but not yet deployed or tried against the real backend; see **Status** at the end for where to pick up. Decisions are recorded here. Terms that are settled are in `GLOSSARY.md`.

To reopen the design, run `/mattpocock-skills:grill-with-docs` and point it at this file. Ask questions **one at a time**, each with a recommended answer, and record each answer here and in `GLOSSARY.md` as soon as it is given. The backend repo (`../backend-poker-timer`) is read only for facts; this repo is where the design lives.

## Goal

Build the UI for the backend in `../backend-poker-timer`. It provides Google sign-in, tournament records, profiles with avatars, photo uploads and a leaderboard. Its spec is `openspec/changes/add-mvp-backend/`, and `handoff.md` there gives its deployed stages. The backend's last open check, task 14.3, needs this UI. That check is: sign in on `prod`, record a tournament with a photo, then sign out and read the leaderboard while signed out.

## Backend facts that shape the UI

- The leaderboard (`GET /api/leaderboard`) is public, needs no sign-in, and is recomputed on each read. Each entry has: rank, display name, avatar URL, wins, tournaments played, win rate, total winnings, latest winning hand and `lastWonAt`. Since contracts 1.0.0, every member with a win has their own rank, full ties go to the most recent winner, and only members with 0 wins share the last rank (Decisions 17 and 18).
- Tournament routes appear to need a session (`requireSession` in `packages/api/src/app.ts`). Tournament photos are private, served through signed URLs that expire within an hour.
- Keeping the timer in sync with the backend is out of scope for the backend's MVP. A tournament is recorded after it ends, so the leaderboard doesn't change during a game.
- Guests (players without accounts) can't be recorded, and the Winner must be a member.
- Contract timestamps (`playedOn`, `createdAt`, `updatedAt`) are whole epoch milliseconds, UTC instants with no offset; the database stores them as millisecond `timestamptz`. Tournament recency is ordered by `playedOn`, then `createdAt`, then `id`.

## Decisions

1. **Scope, in vertical slices:** (1) read-only leaderboard, public with no auth; (2) sign-in and sign-out; (3) recording a tournament, with photo; (4) profile and avatar. The admin UI is out for now.
2. **(Superseded by Decisions 15–19.) The main screen honors the Reigning Champion:** the Winner of the most recent Tournament, with avatar, name, winning hand and date, shown throughout the game as a single card. It is not a top-3 list, not the all-time leader, and not both.
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
15. **Champion card placement (was Q10):** bottom left, beside Upcoming Blinds, shown from Not Started through play (under the Break overlay like everything else). It honors one single win, the most recent Tournament's, and is separate from the leaderboard of most wins. It shows the **Last Winner**.
16. **Two honors, two terms (was Q11):** the **Last Winner** is the Winner of the most recent Tournament (one win, Decision 9's `lastWonAt`). The **Reigning Champion** is the member ranked first on the Leaderboard. Both appear on the main screen, which replaces Decision 2's "one card, not both". Placement: Decisions 15 and 19.
17. **Ties for first go to the most recent winner (was Q12):** when members tie on the Leaderboard (same win count, same Winning Hands newest first), the one whose latest win is most recent ranks above the others and is the Reigning Champion. In six Tournaments alternating Alice, Bob, Alice, Bob, Alice, Bob with identical hands, Bob is champion after T6. This replaces the backend's display-name tiebreak.
18. **Distinct ranks (was Q13):** every member with a win has their own rank number (1 Bob, 2 Alice, not 1, 1). Only members with no wins share the last rank. Backend change: drop shared ranks for members with wins.
19. **Reigning Champion card placement (was Q14):** bottom right, mirroring the Last Winner card across Upcoming Blinds. It shows avatar, name and win count, and links to `/leaderboard`. Both cards show even when the same member holds both honors.
20. **Empty and offline cards (was Q15):** with no recorded wins, both cards show "No winner yet". If the Leaderboard can't be fetched, both cards are hidden, the error is logged to the console, and the timer is unaffected. The Leaderboard is fetched once per page load, with no polling.
21. **Order of work (was Q16):** (1) a frontend-only refactor PR: Round → Level throughout (`currentRound`, `ROUND_TIMES`, `round-timer.tsx`, `round-settings.tsx`, "Round time", "Round: N", "N min Round"), `setStartingChips` → `setStartingBlind`, the Color-up Break after the 15 blind, and "Take Break" disabled until Start; (2) one backend contracts **major** release (`@pstephenwille/poker-timer-contracts`) carrying `finalHandOpponentIds`, `lastWonAt`, the most-recent-win tiebreak and distinct ranks, together with the backend's terminology fixes: "final-round opponents" → Final Hand Opponents (`packages/contracts/src/tournament.ts`, `fixtures.ts`, `tournament-store.ts`, `tournament-routes.ts`, `db/schema.ts`, and the openspec proposal, design, tasks and `tournament-records` spec), the spec scenario "knocked out in the final round" → "in the Final Hand", and "round-by-round history" in the proposal → "hand-by-hand history"; (3) the frontend slices from Decision 1, built on that release.
22. **Rename the database column too (was Q17):** the `opponentIds` column (`packages/api/src/db/schema.ts`, created in `drizzle/0002_tournaments.sql`) is renamed to match `finalHandOpponentIds` by a migration in the same contracts major release, so the old name doesn't remain in the database. Write an ADR in the backend repo when doing it (hard to reverse on `prod`, and a real trade-off against mapping the old name in code). Amended in session 5: opponents are actually stored as the `is_opponent` boolean on `tournament_participants`, so the rename is `is_opponent` → `is_final_hand_opponent`. It is done in one migration even though the backend README asks for expand-then-contract. Prod can't read or record Tournaments for the minute or two between the migration and the deploy, which is accepted because Tournaments are recorded after games. The ADR records this exception.

23. **End Tournament hands off to recording (was Q2 of session 4):** once the Winner is known, a player presses **End Tournament** on the timer. It is enabled only once the Tournament has started (Running or Paused), and asks for confirmation because it can't be undone. Confirming Resets the timer to Not Started and opens the recording form, filled in with everything already known, including `playedOn` set to the moment the Tournament ended. The form also lives at `/tournaments/new`, linked from the header, so a Tournament can be recorded later. Leaving the form never touches the timer (amended by Q12 of session 4, so that recording a past Tournament mid-game can't wipe the running clock). Pause is unchanged: it stops the clock mid-game without touching the settings.

24. **Participants are picked on the form (was Q3 of session 4):** the form lists every Member of the group (`GET /api/members`; the backend has one group, which every account joins at first sign-in). The previous Tournament's Participants are checked by default. The timer stays unaware of players, Members and the network. Deactivated Members (`active: false`) are left off the list (was Q4).

25. **Recording while signed out (was Q5 of session 4):** End Tournament works the same whether or not anyone is signed in. It opens `/tournaments/new?playedOn=<ms>`, which carries the known data in the URL. When signed out, the form shows "Sign in to record" in place of its fields; that goes through `/auth/login` with `returnTo` set to the same URL, so `playedOn` survives the trip to Google. The timer has already Reset by then.

26. **Pot is entered directly (was Q6 of session 4):** the form asks for the Pot in whole dollars, starting with the previous Tournament's Pot. Working the Pot out from a Buy-in and the Participants is a future feature.

27. **Form fields follow the contract (was Q7 of session 4):** Participants (Decision 24), a Winner chosen from the checked Participants, a Winning Hand from the ten categories, the Pot (Decision 26), optional Final Hand Opponents chosen from the Participants other than the Winner, an optional Note of up to 500 characters, and an optional **photo** (a file input, so phones can take one with the camera). Save creates the Tournament first and then uploads the photo to it. If the upload fails, the Tournament stays recorded and the form says the photo didn't make it.

28. **After saving, show the Leaderboard (was Q8 of session 4):** a successful save goes to `/leaderboard` with the new Tournament's Winner highlighted. Going back to the timer (now Not Started) fetches the Leaderboard again for both cards, which extends Decision 20's "once per page load" to "once each time the timer screen is shown".

29. **A failed photo can be retried (was Q9 of session 4):** if the upload fails after the Tournament is saved, the form stays open with "Tournament recorded. The photo didn't upload." and two buttons: **Try again** (uploads the same file to the saved Tournament) and **Skip photo** (goes on to the Leaderboard). The other fields are locked, so the Tournament can't be recorded twice.

30. **Played on is editable (was Q10 of session 4):** the form always shows Played on as an editable date and time in the viewer's local time, pre-filled from the URL's `playedOn`, or with now when there is none. Times in the future are rejected with "Played on can't be in the future" (the backend allows 5 minutes of clock drift).

31. **The timer screen holds the table during play (was Q11 of session 4, reversed after Q13 and settled by Q14):** while the Level's clock is Running, or a Break is on (the Level's clock is stopped and the overlay covers the screen), every link away from the timer (header, champion cards) is disabled with the hint "Pause the game to leave the timer". From Not Started or Paused you can leave. A Paused Tournament survives moving between pages in the app, because the timer's state sits above the routes, and it is still Paused when you come back. Players who want the Leaderboard, Me or admin pages during a game open them on their own device. There is no mini clock in the header.
32. **No sign-in on the timer's device during a game (was Q13 of session 4):** "Sign in" is disabled from Start until the Tournament is ended or Reset (Running, Paused and On Break), because sign-in reloads the page and would lose the Tournament. Players can sign in on their own devices. Signing in on the timer's device after End Tournament goes through the form (Decision 25), when the timer is already Not Started.
33. **Register once; the host's device stays signed in (was Q15 of session 4):** a Member registers by signing in with Google once, usually on their own phone, which makes them a Member (no per-game sign-in; sessions last 30 days idle, 90 days at most). The timer's device is normally left signed in as the **host**, who records each Tournament and becomes its `recordedById`. Any Member can also record from their own device. Header: signed in, a small avatar with a menu holding **Me** and **Sign out**; signed out, a quiet **Sign in** link (disabled during a game, Decision 32). "Sign in to record" (Decision 25) appears only when the host's session has expired. Amended in session 5: **Sign out is a full sign-out.** It calls `POST /api/auth/logout`, then goes to the returned `signOutUrl`, so Cognito's own session ends too and the next Sign in on that device can be a different Member. Session-only sign-out was rejected: Cognito would sign the previous Member straight back in for about an hour. Sign-out reloads the page, so, like Sign in, it is disabled from Start until the Tournament is ended or Reset. Nobody changes host mid-game. (Amended by Decision 36: a host who sat a game out records it like any other.)
34. **Registering at the table (was Q17 of session 4):** for a group whose players register on the night, the form (and its signed-out "Sign in to record" prompt) shows a "Not listed? Scan to register" QR code linking to sign-in, so players register on their own phones while the host signs in on the timer's device. The Participant list fetches again whenever the form's window regains focus and has a Refresh button, keeping checked boxes and filled fields. A note under the list says players without an account can't be recorded (no Guests, and the Winner must be a Member).
35. **Sign-in failures (was Q16 of session 4):** a dismissible banner shows the message for the backend's `signinError` code, then the code and `ref` are removed from the URL. Messages: `cancelled` "Sign-in was cancelled."; `expired` "Sign-in took too long. Please try again."; `deactivated` "This account has been deactivated. Ask an admin to reactivate it."; `failed` "Sign-in failed. Please try again. (ref: <id>)". Only `failed` shows the `ref`. Sign-in from the register QR code (Decision 34) returns to `/me`.
36. **Any Member can record (session 6, 2026-11-25):** any signed-in Member can record a Tournament, whether or not they are one of its Participants. Participants are limited to the group's Members. The app has no way to know who played except the form's checkboxes, so requiring the recorder to be a Participant verified nothing; it only stopped a host who sat out. Backend change: drop `recorder_not_participant` from `POST /api/tournaments`, and the rule that `PATCH` must keep the recorder among the Participants, with their tests and the openspec proposal, design, tasks and `tournament-records` spec. `recordedById` still records who recorded it, and editing and deleting are still limited to the recorder or an admin. This amends Decision 33's "a host who sat a game out has it recorded from a player's phone".

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

Session 5 (2026-11-24) opened slice 4, but its first question (what `/me` holds) was skipped, so slice 4 is still undesigned. It then implemented Decision 21 through slice 2.

### Done

- **Step 1 (frontend refactor):** Round → Level, `setStartingBlind`, the Color-up Break after the 15 blind, and "Take Break" disabled until Start. Merged as PR #5.
- **Step 2 (backend contracts 1.0.0):**
  - `finalHandOpponentIds`, `lastWonAt`, the most-recent-win tiebreak and distinct ranks.
  - The column rename, with ADR `docs/adr/0001-rename-opponent-column-in-one-migration.md` in the backend.
  - Openspec tasks 16.1–16.3.
  - Merged as backend PR #21. It's published to GitHub Packages and deployed to `dev` and `prod`.
- **Slice 1 (read-only Leaderboard):** PRs #6–#11.
  - Vitest and the contracts package.
  - `pickHonors`.
  - The `/leaderboard` page.
  - The Last Winner and Reigning Champion cards.
  - Navigation that holds the table during play (Decision 31).
  - Styles, with the Leaderboard dropping columns below 600px.
- **Slice 2 (sign-in and sign-out):** PRs #13–#15, after the Decision 33 amendment in PR #12.
  - The header shows the signed-in Member, or Sign in with `returnTo`.
  - Full sign-out through Cognito.
  - Both are disabled from Start until Reset.
  - The sign-in error banner (Decision 35).

### Next

1. **Try slice 2 against the real backend, signing in from `pnpm dev`.** Against an ordinary stage, sign-in can't complete from localhost: Google returns to the stage's own address, and the backend refuses a `POST` whose `Origin` is localhost. So the chosen route is a personal stage that serves localhost:
   1. **Merge backend PR #22 (`local-frontend-origin`).** Done on 2026-11-25 as `69c7cb4`, and its Deliver run redeployed `dev` and `prod`. It adds `LOCAL_FRONTEND_ORIGIN`, documented in the backend `README.md` under "Serve a local frontend dev server from a personal stage".
   2. **Check the AWS credentials** with a read-only `aws sts get-caller-identity`. Done on 2026-11-25: they work for user `swille` in account `512808912517`.
   3. **Deploy the personal stage:** `LOCAL_FRONTEND_ORIGIN=http://localhost:3333 pnpm sst deploy --stage stephen` in the backend repo. The `stephen` stage's four SST secrets (`DatabaseUrl`, `GoogleClientId`, `GoogleClientSecret`, `SigninCookieKey`) were all confirmed set on 2026-11-25; see the backend's `handoff.md`. Deployed from commit `2ca0fea` on 2026-11-25; the stage's frontend bucket is `poker-timer-stephen-frontendbucket-ubscxsen` and its distribution is `E1D10KR82CPHON`.
   4. **Run the frontend against it:** `API_ORIGIN=https://dtp80nyn4zjug.cloudfront.net pnpm dev`. Use the URL `sst deploy` prints if it differs. A `pnpm dev` started without `API_ORIGIN` proxies to `dev`, so sign-in ends on `dev`'s placeholder page.
   5. **In Chrome or Firefox at http://localhost:3333, checked on 2026-11-25:**
      - Passed: signing in shows your avatar.
      - Passed: Sign out ends both sessions and returns to localhost; the next Sign in goes to Google.
      - Passed: Sign out is disabled while a game runs and is enabled again after Reset.
      - Skipped: cancelling at Google shows "Sign-in was cancelled." Google shows Cancel only on its consent screen, which it skips once consent is given; use a private window or remove the app at https://myaccount.google.com/connections to see it.
2. **Deploy the frontend to `dev`** (see below) and check the same things there. Done on 2026-11-25 at https://d3qe36cyda6430.cloudfront.net:
   - Passed: signing in shows your avatar.
   - Passed: Sign out ends both sessions and returns to `dev`; the next Sign in goes to Google.
   - Passed: Sign out is disabled while a game runs and is enabled again after Reset.
   - Skipped again: cancelling at Google. It's still unchecked anywhere.
3. **Slice 3, recording a Tournament** (Decisions 23–30, 34 and 35's `/me` return). Split on 2026-11-25 into the PRs under **Slice 3 plan** below, built in that order. Decision 36 settled who can record. Its backend change is a separate backend PR; until it ships, a recorder who isn't a Participant sees the backend's refusal through PR 2's error message. Still undecided:
   - Which QR code library to use. PR 7.
4. **Then deploy to `prod` and run backend task 14.3** through the real UI.
5. **Slice 4 (profile and avatar) and the admin UI** still need designing.

### Slice 3 plan

One PR per row, each on its own branch from the latest `master`, built in order. Every test renders the app through `src/testing/render-app.tsx` against `src/testing/fake-backend.ts` and checks what a person sees and does. Each PR passes `pnpm test`, `pnpm lint` and `pnpm build` before it goes up.

1. **The `/tournaments/new` page and its header link** (Decisions 23 and 25).
   - Signed out, the page shows "Sign in to record", linking to `/api/auth/login` with `returnTo` set to the page's URL, including `?playedOn`.
   - Signed in, it shows the form and not the prompt.
   - The header's "Record" link opens the page from Not Started and Paused, and is disabled while Running or On Break (Decision 31).
2. **Recording with the required fields** (Decisions 24, 26, 27 and 30). Participants come from `GET /api/members` and the previous Tournament from `GET /api/tournaments`; Save calls `POST /api/tournaments`.
   - Only active Members are listed, and the previous Tournament's Participants are checked.
   - The Winner choices are only the checked Participants, and unchecking the chosen Winner clears it.
   - The Pot starts at the previous Tournament's Pot. With no previous Tournament, it's empty.
   - Played on comes from `?playedOn` in local time, or now when there's none. A future time shows "Played on can't be in the future" and doesn't save.
   - Save is blocked with fewer than two Participants or no Winner.
   - A valid save sends the expected `CreateTournament` body and lands on `/leaderboard`.
   - A backend error keeps the form filled and shows the message.
3. **Final Hand Opponents and Note** (Decision 27).
   - The opponent choices are the Participants other than the Winner. Changing the Winner removes them from the opponents.
   - The Note stops at 500 characters.
   - Both are left out of the request body or sent empty when unused, and sent as entered when used.
4. **After a save** (Decision 28).
   - `/leaderboard` highlights the new Winner's row, and only right after a save.
   - Going back to the timer fetches the Leaderboard again, so both cards show the new Tournament.
   - Moving between pages without saving also fetches it again each time the timer screen is shown.
5. **The photo** (Decisions 27 and 29). The upload is `POST /api/tournaments/:id/photo/uploads` for a grant, a multipart post of the grant's fields and the file to its URL, then `POST /api/tournaments/:id/photo` with the `mediaId`.
   - Save creates the Tournament, then requests the grant, posts the file and confirms the upload, in that order.
   - A failed upload shows "Tournament recorded. The photo didn't upload.", locks the other fields and never sends a second `POST /api/tournaments`.
   - Try again reuses the same file and Tournament, and goes on to `/leaderboard` once it succeeds.
   - Skip photo goes to `/leaderboard`.
   - Saving without a photo makes no upload calls.
6. **End Tournament on the timer** (Decision 23).
   - It's disabled at Not Started and enabled while Running or Paused.
   - Cancelling the confirmation leaves the clock and settings as they were.
   - Confirming Resets the timer to Not Started and opens `/tournaments/new?playedOn=<ms>` at the moment the Tournament ended, using a fake clock.
   - Leaving the form afterwards doesn't touch the timer.
7. **Registering at the table** (Decisions 34 and 35).
   - The QR code shows on the form and on the signed-out prompt, and encodes the sign-in URL that returns to `/me`.
   - Focusing the window again, or pressing Refresh, adds a newly registered Member and keeps the boxes already checked and the fields already filled.
   - The note says players without an account can't be recorded.

### Deploying the frontend by hand

The `dev` stage is https://d3qe36cyda6430.cloudfront.net, and `prod` is https://d228ov3aayfbkh.cloudfront.net. The backend's `README.md` gives the steps.

1. Find the stage's `frontendBucket` and `distributionId`. `sst deploy` prints them, or find them with `aws cloudfront list-distributions`: match the stage's domain and read its S3 origin.
2. Run `pnpm build`.
3. Run `aws s3 sync dist/ s3://<frontendBucket>/ --delete`. That replaces the placeholder `index.html`.
4. Run `aws cloudfront create-invalidation --distribution-id <distributionId> --paths "/*"`.

Credentials for AWS account `512808912517` are needed in the environment, exported before the editor or Claude Code starts. This needs AWS CLI v2. The current machine has v2.42.3, and the credentials added on 2026-11-25 work.

The SST Router's CloudFront origin is `placeholder.sst.dev`, not the bucket, so find the bucket by name with `aws s3api list-buckets` instead. For `dev`, the bucket is `poker-timer-dev-frontendbucket-htazhobe` and the distribution is `E1J1N6X6GCOF47`.

On 2026-11-25 the frontend was deployed to `dev` from master at `526b16f`. Nothing has been uploaded to `prod` yet.

### Setting up a new machine

- **Node 24 and pnpm.** Run `pnpm install`, then `pnpm test`, `pnpm lint` and `pnpm build`.
- **Installing the contracts from GitHub Packages needs a token,** even though the package is public:
  - Create a classic personal access token with only `read:packages`, and export it as `GITHUB_TOKEN` before starting the editor or Claude Code.
  - Add `//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}` to `~/.npmrc`. pnpm ignores tokens from environment variables in a project `.npmrc`, which names only the registry.
- **`pnpm dev`** serves on port 3333 and proxies `/api` to `dev`, or to `API_ORIGIN` when it's set.
- **The `gh` CLI wasn't installed** in session 5, so PRs were opened by hand from the pushed branches.

### How the work is run

- **One branch and PR per task.** Each starts from `master` once the previous PR is merged.
- **One step at a time.** Stop after each step for review.
- **Diffable edits.** Make file changes with diffable edits, not shell rewrites.
- **Test-first,** with tests at agreed seams. So far that's the whole app rendered with `fetch` answered by `src/testing/fake-backend.ts`, plus pure functions like `pickHonors`.
- **US spelling** (honors, color).
