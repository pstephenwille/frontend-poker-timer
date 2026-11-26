## 1. Checks and build

- [ ] 1.1 Add `.github/workflows/pr-gate.yml`: on every pull request, install with the contracts package read through `GITHUB_TOKEN`, then `pnpm lint`, `pnpm test` and `pnpm build` (Decision 54); verify a PR runs it and a deliberately failing test fails it
- [ ] 1.2 Turn on Vite's build manifest (`build.manifest: true`); verify `pnpm build` writes `dist/.vite/manifest.json` naming every file under `dist/assets/`

## 2. Account setup (by hand)

- [ ] 2.1 **Backend PR:** add `infra/aws-account/frontend-deploy-role-trust.json` (only `pstephenwille/frontend-poker-timer` in the `dev` and `prod` environments) and `frontend-deploy-role-policy.json` (list, get, put and delete objects in the `dev` and `prod` frontend buckets; create and get invalidations on their two distributions), with the `ACCOUNT_ID` placeholder; add the role's row to the backend README's AWS table (Decisions 52 and 58)
- [ ] 2.2 By hand: create role `github-poker-timer-frontend` from those files; in this repo set the Actions variable `AWS_DEPLOY_ROLE_ARN`; create the `dev` and `prod` environments with `FRONTEND_BUCKET` and `DISTRIBUTION_ID` (Decision 53), and required reviewers on `prod`; grant this repo read access under the contracts package's **Manage Actions access**

## 3. Deploy

- [ ] 3.1 Add `.github/workflows/deliver.yml`: on push to `master`, a build job without AWS credentials runs lint, tests and the build and uploads `dist/` as an artifact; a reusable upload job assumes the role and deploys `dev`, then `prod` after approval (Decisions 51 and 54). The upload reads the live `.vite/manifest.json`, syncs `assets/` with the immutable header and no deletion, syncs everything else with `no-cache` and `--delete` outside `assets/`, deletes assets in neither manifest, invalidates `/*` and waits (Decisions 55 and 56); verify a merge deploys `dev`, `prod` waits for approval, the headers are right, and the previous build's chunks are still served
- [ ] 3.2 Replace "Deploying the frontend by hand" in `continue-backend-integration/handoff.md` with a pointer to the workflow, and add the "Deployment and CI setup" section to `README.md`: the role variable, the environments and their variables, `prod`'s reviewers, contracts package access, and the rule that a frontend change needing a newer contracts version is approved for `prod` only after that backend release is live on `prod` (Decisions 53 and 58)

## 4. Backend placeholder

- [ ] 4.1 **Backend PR:** set `retainOnDelete: true` on `FrontendPlaceholder` in `sst.config.ts` and deploy to `dev` and `prod` (Decision 57); verify `index.html` in both buckets is still the frontend's
- [ ] 4.2 **Backend PR**, after 4.1 is live on `prod`: remove `FrontendPlaceholder` and `infra/placeholder/`, and the placeholder smoke check from the backend README; verify both stages still serve the frontend after the deploy
