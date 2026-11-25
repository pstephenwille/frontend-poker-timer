## 1. Production

- [ ] 1.1 Deploy the frontend to `prod` from the latest `master` (see `handoff.md`, "Deploying the frontend by hand"): find `prod`'s frontend bucket by name with `aws s3api list-buckets`, and its distribution by its domain `d228ov3aayfbkh.cloudfront.net`; look at the bucket before `aws s3 sync dist/ … --delete`; verify after the invalidation that `/`, `/leaderboard`, `/tournaments/new` and `/me` serve the new bundle and `/api/leaderboard` answers 200. No backend change.
- [ ] 1.2 Run backend task 14.3 on `prod` through the real UI: sign in with Google; check that `__Host-session` is `HttpOnly`, `Secure`, `SameSite=Strict` and `Path=/` with no `Domain`, and that no token is readable by page scripts; record a Tournament with a photo (a second Google account must have signed in once, since a Tournament needs two Members); sign out and read the Leaderboard signed out. Verify the photo is served as WebP of at most 1600 px with no EXIF, through a signed URL that expires within an hour, and that the Winner ranks correctly. Then tick 14.3 in the backend's `tasks.md` and update its `handoff.md` in a backend PR.

## 2. Slice 4: profile and avatar

- [ ] 2.1 Design slice 4: settle the open questions in `design.md` one at a time, recording each as a numbered Decision from 42; add slice 4's capability specs to this change and split its build into one task per PR below; verify `openspec validate continue-backend-integration --strict` passes
- [ ] 2.2 Add **Me** to the account menu (Decision 33), linking to `/me` and held during play like the header's other links (Decision 31); verify app-level tests that it opens `/me` from Not Started and Paused and is disabled while Running and On Break

## 3. Admin UI

- [ ] 3.1 Design the admin UI after slice 4, recording each answer as a numbered Decision, and split its build into one task per PR here

## 4. Loose ends

- [ ] 4.1 Check, on `dev` or `prod`, that cancelling at Google shows "Sign-in was cancelled." Google shows Cancel only on its consent screen, which it skips once consent is given, so use a private window or remove the app at https://myaccount.google.com/connections first. It has been skipped twice.
- [ ] 4.2 Review the choices made while building slice 3 (`handoff.md`, "Choices made while building slice 3") and turn any change wanted into its own task here
- [ ] 4.3 Drop a Participant who is no longer listed (deactivated) from the form's draft when the Participant list refreshes, so the backend doesn't refuse the save; verify an app-level test
