# Proposal

## Why

The frontend reaches `dev` and `prod` only by hand: someone with AWS credentials builds locally, runs `aws s3 sync` into the stage's bucket and invalidates CloudFront (`continue-backend-integration/handoff.md`, "Deploying the frontend by hand"). That skips `prod`'s required reviewers, leaves no record of which commit is live, runs no checks on pull requests, and needs personal credentials with write access to shared buckets. Deployments to shared stages must happen only through CI. The backend's design always expected this repo's CI to upload its build (backend `design.md`, "Hosting: single origin through CloudFront").

The design is settled in Decisions 51–58 of `docs/handoff-backend-integration.md`.

## What Changes

- A PR check runs lint, tests and the build on every pull request (Decision 54).
- A deploy workflow builds `master` without AWS credentials, then an upload job deploys `dev`, waits for approval in the `prod` environment, and deploys `prod` (Decisions 51 and 54).
- Uploads set cache headers in two passes, keep the current and previous builds' assets, and prune older assets using Vite's manifest (Decisions 55 and 56).
- A new hand-made IAM role, `github-poker-timer-frontend`, scoped to the two frontend buckets and distributions (Decision 52).
- Each stage's bucket and distribution are GitHub environment variables (Decision 53).
- **Backend:** the role's policy files, and removal of the `FrontendPlaceholder` object in two releases (Decision 57).
- Each README lists its own CI's settings (Decision 58).

## Capabilities

### New Capabilities

- `frontend-delivery`: how a merged frontend change is checked, built and deployed to `dev` and `prod`.

## Impact

- Hand deploys of the frontend to `dev` and `prod` stop; the hand-deploy section of `continue-backend-integration/handoff.md` is replaced once CI works.
- Setup done by hand, once: the IAM role, the repo variable `AWS_DEPLOY_ROLE_ARN`, the `dev` and `prod` environments with `FRONTEND_BUCKET` and `DISTRIBUTION_ID`, `prod`'s required reviewers, and read access to the contracts package for this repo's Actions.
