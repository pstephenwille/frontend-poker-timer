## ADDED Requirements

### Requirement: The account menu offers Me
When a Member is signed in, the menu opened from their avatar in the header SHALL offer **Me**, linking to `/me`, beside **Sign out** (Decision 33).

#### Scenario: Opening Me
- **WHEN** a signed-in Member opens the account menu from Not Started or Paused, and chooses Me
- **THEN** the app shows `/me`

### Requirement: Me is held during play
Me SHALL be disabled, with the hint "Pause the game to leave the timer", while the Level's clock is Running or a Break is on, like every other link away from the timer (Decision 31).

#### Scenario: Me while Running
- **WHEN** the Level's clock is Running and a signed-in Member opens the account menu
- **THEN** Me is disabled with the hint "Pause the game to leave the timer"
