## ADDED Requirements

### Requirement: Me shows the signed-in Member's profile
When a Member is signed in, `/me` SHALL show their avatar, display name and username, and their stats from `GET /api/members/{id}`: Tournaments played, wins, win rate, total winnings and wins by Winning Hand (Decision 42). It SHALL show no other Member's profile (Decision 45).

#### Scenario: Opening Me signed in
- **WHEN** a signed-in Member opens `/me`
- **THEN** the page shows their avatar, display name, username, Tournaments played, wins, win rate, total winnings and wins by Winning Hand

#### Scenario: A Member who hasn't played
- **WHEN** a signed-in Member who has played no Tournament opens `/me`
- **THEN** the page shows no win rate and no wins by Winning Hand

#### Scenario: Opening Me signed out
- **WHEN** a visitor who isn't signed in opens `/me`
- **THEN** the page offers Sign in and shows no profile

### Requirement: Changing the avatar
`/me` SHALL let the Member choose an image that is uploaded and confirmed at once, after the same type and size checks as the Tournament photo, and SHALL show "Processing…" until the backend's `avatarStatus` is no longer `"processing"` (Decision 43).

#### Scenario: Uploading a new avatar
- **WHEN** a signed-in Member chooses a JPEG under 10 MB with "Change avatar"
- **THEN** the image is uploaded and confirmed, and the page shows "Processing…" until `GET /api/me` reports the avatar as `"uploaded"`, then shows the new avatar

#### Scenario: A file that would be refused
- **WHEN** a signed-in Member chooses a file of a type the backend doesn't accept, or one over 10 MB
- **THEN** the page says why and uploads nothing

### Requirement: Going back to the Google avatar
`/me` SHALL offer "Use Google avatar" only when `avatarStatus` is `"uploaded"`, and pressing it SHALL remove the uploaded avatar (Decision 43).

#### Scenario: Removing an uploaded avatar
- **WHEN** a Member with an uploaded avatar presses "Use Google avatar"
- **THEN** the uploaded avatar is removed and the page and header show the Google avatar

#### Scenario: No uploaded avatar
- **WHEN** a Member whose `avatarStatus` is `"google"` opens `/me`
- **THEN** "Use Google avatar" isn't shown

### Requirement: Setting the username
`/me` SHALL let the Member save or clear a username, checked against the contracts' `Username` rules before it is sent, with the hint "Shown to the group instead of your Google name" (Decision 44).

#### Scenario: Saving an available username
- **WHEN** a signed-in Member saves the username `Mike.AllIn` and nobody holds it
- **THEN** the page and header show `Mike.AllIn` as their display name

#### Scenario: A taken username
- **WHEN** a signed-in Member saves a username another Member holds in any letter case
- **THEN** the page says "That username is taken." and keeps what they typed

#### Scenario: A username that breaks the rules
- **WHEN** a signed-in Member saves `mike..j`
- **THEN** the page shows the contracts' username rules and sends nothing

#### Scenario: Clearing the username
- **WHEN** a Member with a username presses Clear
- **THEN** the username is removed and the page and header show their Google name
