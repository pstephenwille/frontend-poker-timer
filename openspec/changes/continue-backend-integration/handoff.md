# Handoff: continue-backend-integration

Status as of 2026-11-25, after session 9, for picking up on another machine or in a new session. `tasks.md` is the source of truth for what's left. This file records where things are deployed, what's done, and how the work is run. The design, as numbered Decisions, is in `docs/handoff-backend-integration.md`. Check PR and deploy state on GitHub rather than trusting this file.

## Where it stands

- **Slices 1–3 are built, merged and checked on `dev`:** the read-only Leaderboard, sign-in and sign-out, and recording a Tournament.
- **The frontend is on `dev`** from `master` at `d957c17`, which records a Tournament with only its Winner (`require-only-winner`), and **on `prod`** from `master` at `cc64bef` (task 1.1), which still needs two Participants.
- **The backend** is at `1c3dde9` on `dev`, with contracts `1.1.0`, which lets the Winner be the only Participant (Decision 46). `prod` is still at `6ccec59` with contracts `1.0.0`: that Deliver run's `prod` job is waiting for approval. Approve it before deploying the frontend to `prod`, or the backend will refuse Winner-only Tournaments. Its change `add-mvp-backend` has two open tasks: 14.1 (custom domain) and 14.3 (the `prod` check through this UI).
- **Slice 4 is designed** (Decisions 42–45, the `member-profile` spec) and split into tasks 2.2–2.8. One needs a backend change: `avatarStatus` on `Me`, as contracts 1.2.0 (task 2.5).
- **Next:** task 2.2, Me in the account menu, not yet started: no branch is pushed. The menu is `src/members/account-menu.tsx`, its tests are in `src/members/sign-out.test.tsx` and `account.test.tsx`, and the requirements are in `specs/account-menu/spec.md`. Build it test-first.
- **On hold:** task 1.2 (backend task 14.3), until a second Google account is available or `require-only-winner` reaches `prod`. `prod` has one Member and no Tournaments.
- **To settle in task 2.3:** replacing the placeholder `/me` drops its "You're registered, <display name>. The host can now check you on the Record form." line (Decision 41). Ask whether to keep it for players arriving from the register QR code.
- **Also open:** `openspec/changes/require-only-winner`, at 4/5 tasks. It is built and checked on `dev`; task 4.1's `prod` deploy was skipped for now.

## Setting up a new machine

1. **Node 24 and pnpm.** Clone this repo and `../backend-poker-timer` side by side, each on an up-to-date `master`.
2. **A GitHub token for the contracts package,** which is on GitHub Packages and needs a token even though it's public:
   - Create a classic personal access token with only `read:packages`, and export it as `GITHUB_TOKEN` in your shell profile, before starting the editor or Claude Code.
   - Add `//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}` to `~/.npmrc`, and `chmod 600` it. The committed project `.npmrc` names only the registry; pnpm ignores environment-variable tokens in a project `.npmrc`, so the auth line must be in `~/.npmrc`.
3. **Install and check:** `pnpm install`, then `pnpm test`, `pnpm lint` and `pnpm build`. The backend's integration tests need Docker running.
4. **AWS CLI v2,** with credentials for account `512808912517` exported before the editor or Claude Code starts. `aws sts get-caller-identity` should show user `swille`.
5. **The `gh` CLI.** Without sudo, download the release tarball, check it against the release's checksums file, and copy `bin/gh` into `~/.local/bin`. `gh` prefers `GITHUB_TOKEN`, which only reads packages, so sign in with `env -u GITHUB_TOKEN gh auth login` and run every `gh` command as `env -u GITHUB_TOKEN gh …`.
6. **The `openspec` CLI** (2.1.1 or later) for `openspec list` and `openspec validate <change> --strict`. The `openspec-*` skills are installed per machine.
7. **`pnpm dev`** serves on port 3333 and proxies `/api` to `dev`, or to `API_ORIGIN` when it's set.

## Stages

| Stage | URL | Frontend bucket | Distribution |
| --- | --- | --- | --- |
| `dev` | https://d3qe36cyda6430.cloudfront.net | `poker-timer-dev-frontendbucket-htazhobe` | `E1J1N6X6GCOF47` |
| `prod` | https://d228ov3aayfbkh.cloudfront.net | `poker-timer-prod-frontendbucket-dtssrvvo` | `E278RNH4ORXCJQ` |
| `stephen` (personal) | https://dtp80nyn4zjug.cloudfront.net | `poker-timer-stephen-frontendbucket-ubscxsen` | `E1D10KR82CPHON` |

Each stage serves the frontend and `/api/*` from the same address. The media bucket's CORS allows only the stage's own origin, so photo uploads can't be checked from `pnpm dev`.

## Deploying the frontend by hand

1. **Find the stage's bucket and distribution.** The SST Router's CloudFront origin is `placeholder.sst.dev`, not the bucket, so find the bucket by name with `aws s3api list-buckets`, and the distribution by its domain with `aws cloudfront list-distributions`.
2. **Look before replacing:** `aws s3 ls s3://<bucket>/ --recursive` should show only a previous build or the placeholder `index.html`.
3. **Build:** `pnpm test`, `pnpm lint` and `pnpm build` on an up-to-date `master`.
4. **Upload:** `aws s3 sync dist/ s3://<bucket>/ --delete`.
5. **Invalidate:** `aws cloudfront create-invalidation --distribution-id <id> --paths "/*"`, then `aws cloudfront wait invalidation-completed`.
6. **Verify:** `/`, `/leaderboard`, `/tournaments/new` and `/me` serve the new `assets/index-*.js`, and `/api/leaderboard` answers 200.

## Running the frontend against a personal stage

Against an ordinary stage, sign-in can't complete from localhost: Google returns to the stage's own address, and the backend refuses a `POST` whose `Origin` is localhost. A personal stage deployed with `LOCAL_FRONTEND_ORIGIN` serves localhost instead (backend `README.md`, "Serve a local frontend dev server from a personal stage").

1. **Deploy it** from the backend repo with `LOCAL_FRONTEND_ORIGIN=http://localhost:3333 pnpm sst deploy --stage stephen`. Its four SST secrets (`DatabaseUrl`, `GoogleClientId`, `GoogleClientSecret`, `SigninCookieKey`) are set. `pnpm sst secret list --stage stephen` lists them, but prints their values. It was last deployed on 2026-11-25 from `2ca0fea`.
2. **Run the frontend against it** with `API_ORIGIN=https://dtp80nyn4zjug.cloudfront.net pnpm dev`, using the URL `sst deploy` prints if it differs.

## How the work is run

- **One branch and PR per task.** Each starts from the latest `master` once the previous PR is merged.
- **Sync before starting and before every push:** run `git fetch origin`, then `env -u GITHUB_TOKEN gh pr view --json state`. PRs here are often merged within minutes, and GitHub then deletes the branch. Never push to a merged PR's branch; start a new one from the latest `master` instead.
- **One step at a time.** Stop after each step for review.
- **Diffable edits,** not shell rewrites.
- **Test-first,** at the agreed seams:
  - The whole app rendered by `src/testing/render-app.tsx`, with `fetch` answered by `src/testing/fake-backend.ts`. The Record form's helpers are in `src/testing/record-tournament-form.ts`.
  - Pure functions, like `pickHonors`.
- **Every PR passes** `pnpm test`, `pnpm lint` and `pnpm build`. Backend PRs pass `pnpm test`, `pnpm check`, `pnpm typecheck` and `openspec validate add-mvp-backend --strict`.
- **Design questions one at a time,** each with a recommended answer, recorded as a numbered Decision as soon as it's answered.
- **US spelling and wording:** honors, color, checked rather than ticked.

## Done

- **Step 1, the frontend refactor:** Round → Level, `setStartingBlind`, the Color-up Break after the 15 blind, and "Take Break" disabled until Start. PR #5.
- **Step 2, backend contracts 1.0.0:**
  - `finalHandOpponentIds`, `lastWonAt`, the most-recent-win tiebreak and distinct ranks.
  - The opponent column rename, with ADR `docs/adr/0001-rename-opponent-column-in-one-migration.md`.
  - Backend PR #21.
- **Slice 1, the read-only Leaderboard:** PRs #6–#11. It brought Vitest and the contracts package, `pickHonors`, `/leaderboard`, the Last Winner and Reigning Champion cards, navigation that holds the table during play, and styles.
- **Slice 2, sign-in and sign-out:** PRs #12–#15. Checked on the `stephen` personal stage and on `dev`. Cancelling at Google was skipped (task 4.1).
- **Backend PR #22,** which lets a personal stage serve localhost: merged as `69c7cb4`.
- **Slice 3, recording a Tournament:** one PR per task.
  - PR 1, the Record page: #21.
  - PR 2, the required fields: #22, plus #23, which keeps Played on's exact instant unless it's edited.
  - PR 3, Final Hand Opponents and the Note: #24.
  - PR 4, the new Winner highlighted after a save: #25.
  - PR 5, the photo: #26.
  - PR 6, End Tournament: #27.
  - PR 7, registering at the table, with the placeholder `/me`: #28.
  - Docs: PRs #29 and #30.
- **Backend PR #23** (Decision 36): any Member can record. Merged as `6ccec59`, with openspec task 17.1, and deployed to `dev` and `prod`.
- **Slice 3 checked on `dev`** on 2026-11-25, from `7b6882f` against backend `6ccec59`. All passed:
  - End Tournament, then recording with a photo, lands on the Leaderboard with the Winner highlighted.
  - The photo appears, including one taken on an iPhone.
  - Scanning the QR code registers and lands on `/me`, and the new Member appears when the timer's window is focused again.
  - The six timer buttons wrap sensibly on a narrow screen.
- **Task 1.1, the frontend on `prod`,** on 2026-11-25 from `cc64bef`, bundle `assets/index-Di2953uR.js`. The bucket held only the placeholder `index.html` beforehand. `/`, `/leaderboard`, `/tournaments/new` and `/me` serve the new bundle, and `/api/leaderboard` answers 200. Docs: PR #32.
- **Task 2.1, slice 4 designed:** Decisions 42–45, the `member-profile` spec, and tasks 2.3–2.8. PR #33.
- **`require-only-winner`, tasks 1.1–3.2** (Decisions 46–49):
  - Design: PR #35. Contracts `1.1.0` for this change and `1.2.0` for `avatarStatus`: PR #36.
  - Backend PR #24: `MIN_PARTICIPANTS` from 2 to 1, contracts `1.1.0` published. Merged as `1c3dde9` and deployed to `dev`; `prod` awaits approval.
  - Frontend PR #37: the Record form and the Leaderboard's Played note.
- **`require-only-winner` checked on `dev`** on 2026-11-25, from `d957c17` (bundle `assets/index-aKTUIsW8.js`) against backend `1c3dde9`. The bucket held only the previous build beforehand. A Tournament with only its Winner saves, and the Leaderboard and both honor cards show it. The `prod` deploys were skipped for now.

## Choices made while building slice 3, for review (task 4.2)

- Save is never disabled; it lists every problem when pressed.
- A Note of only spaces is left out of the request.
- The Leaderboard's highlight survives a reload straight after a save, because browsers keep location state.
- A photo of the wrong type, or over 10 MB, is refused before saving, since storage would refuse it only after the Tournament was recorded.
- End Tournament no longer asks for confirmation (Decision 50).
- A failed refresh of the Participant list keeps the list already shown, with a notice.

## Sessions

- **Session 4 (2026-11-24):** designed slices 2 and 3 (Decisions 23–35).
- **Session 5 (2026-11-24):** opened slice 4 but skipped its first question, then built Decision 21 through slice 2.
- **Session 6 (2026-11-25):** checked slice 2 on a personal stage and on `dev`, first deployed to `dev`, split slice 3 into seven PRs, built PR 1, and settled Decisions 36–39.
- **Session 7 (2026-11-25):** set up a second machine, built slice 3 PRs 2–7, settled Decisions 40 and 41, deployed slice 3 to `dev` and checked it, made the backend change for Decision 36, and moved the remaining work into OpenSpec: this change and `require-only-winner`.
- **Session 8 (2026-11-25):** deployed the frontend to `prod` (task 1.1), put task 1.2 on hold, and designed slice 4 (Decisions 42–45, task 2.1). Stopped before starting task 2.2.
- **Session 9 (2026-11-25):** designed `require-only-winner` (Decisions 46–49), released contracts `1.1.0` for it and moved `avatarStatus` to `1.2.0`, built it, and deployed and checked it on `dev`. Skipped the `prod` deploys.
- **Session 10 (2026-11-25):** removed End Tournament's confirmation (Decision 50), documented signing in locally against a personal stage, and designed `deploy-through-ci` (Decisions 51–58). Nothing of it is built yet; start from that change's `tasks.md`.
