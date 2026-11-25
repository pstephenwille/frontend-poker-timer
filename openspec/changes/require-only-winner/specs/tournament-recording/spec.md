## ADDED Requirements

### Requirement: Recording needs only the Winner
The Record form SHALL save a Tournament once its Winner, Winning Hand, Pot and Played on are given, without requiring any other Participant to be checked. The details of how the Winner is chosen and counted are settled in `design.md` before this is built.

#### Scenario: Only the Winner is given
- **WHEN** a signed-in Member chooses a Winner, a Winning Hand, a Pot and Played on, and checks no other Participant
- **THEN** the form saves the Tournament and shows the Leaderboard

#### Scenario: No Winner is given
- **WHEN** a signed-in Member presses Save without choosing a Winner
- **THEN** the form says "Choose the Winner." and sends nothing
