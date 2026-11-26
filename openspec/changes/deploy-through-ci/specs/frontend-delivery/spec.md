## ADDED Requirements

### Requirement: Pull requests are checked
Every pull request SHALL run `pnpm lint`, `pnpm test` and `pnpm build`, and SHALL fail if any of them fails.

#### Scenario: A failing test
- **WHEN** a pull request breaks a test
- **THEN** its check fails

### Requirement: Shared stages are deployed only by CI
Every push to `master` SHALL build the frontend once and deploy that build to `dev`, then to `prod` only after a reviewer approves in the `prod` GitHub environment. No one SHALL deploy the frontend to `dev` or `prod` by hand.

#### Scenario: A merge to master
- **WHEN** a change is merged to `master`
- **THEN** the build is deployed to `dev`, and `prod` waits for approval

#### Scenario: A contracts version newer than prod's backend
- **WHEN** a frontend change needs a contracts version that the backend has not yet released to `prod`
- **THEN** the reviewer does not approve its `prod` deploy until that backend release is live on `prod`

### Requirement: The build runs without AWS credentials
The job that installs dependencies and builds SHALL have no AWS credentials. Only a separate upload job, which runs no project dependencies, SHALL assume the frontend deploy role.

#### Scenario: A compromised dependency
- **WHEN** a dependency runs code during install or build
- **THEN** that code has no AWS credentials

### Requirement: Cache headers by file kind
An upload SHALL send files under `assets/` with `Cache-Control: public, max-age=31536000, immutable`, and every other file, including `index.html`, with `Cache-Control: no-cache`, then invalidate `/*` and wait for the invalidation to complete.

#### Scenario: Loading the app after a deploy
- **WHEN** a browser loads the app after a deploy
- **THEN** it fetches the new `index.html` and the assets it names

### Requirement: The previous build's assets survive one deploy
An upload SHALL keep every file under `assets/` named in the new build's Vite manifest or in the manifest it replaces, and SHALL delete every other file under `assets/`.

#### Scenario: A tab open across a deploy
- **WHEN** a tab loaded before a deploy requests a chunk of its build afterwards
- **THEN** the chunk is still served

#### Scenario: Two deploys later
- **WHEN** a build has been replaced by two newer deploys
- **THEN** its assets that neither newer build uses are gone from the bucket
