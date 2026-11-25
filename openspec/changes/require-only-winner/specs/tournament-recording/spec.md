## ADDED Requirements

### Requirement: Recording needs only the Winner
The Record form SHALL save a Tournament once its Winner, Winning Hand, Pot and Played on are given, without requiring any other Participant to be checked. The Winner SHALL always be sent as a Participant.

#### Scenario: Only the Winner is given
- **WHEN** a signed-in Member chooses a Winner, a Winning Hand, a Pot and Played on, and checks no other Participant
- **THEN** the form sends `participantIds` holding only the Winner, saves the Tournament and shows the Leaderboard

#### Scenario: No Winner is given
- **WHEN** a signed-in Member presses Save without choosing a Winner
- **THEN** the form says "Choose the Winner." and sends nothing

### Requirement: The Winner is chosen from every active Member
The Record form SHALL offer every active Member as the Winner. Choosing a Member as the Winner SHALL check them as a Participant and lock that checkbox while they are the Winner.

#### Scenario: Choosing an unchecked Member as the Winner
- **WHEN** a signed-in Member chooses an unchecked Member as the Winner
- **THEN** that Member's Participant checkbox is checked and cannot be unchecked

#### Scenario: Changing the Winner
- **WHEN** a signed-in Member changes the Winner to another Member
- **THEN** the previous Winner stays checked as a Participant and their checkbox can be unchecked again

### Requirement: Final Hand Opponents are optional and chosen from every active Member
The Record form SHALL offer every active Member except the Winner as a Final Hand Opponent, and SHALL NOT require any. Marking a Member as a Final Hand Opponent SHALL check them as a Participant and lock that checkbox while they are marked.

#### Scenario: Marking an unchecked Member as a Final Hand Opponent
- **WHEN** a signed-in Member marks an unchecked Member as a Final Hand Opponent
- **THEN** that Member's Participant checkbox is checked and cannot be unchecked

#### Scenario: Unmarking a Final Hand Opponent
- **WHEN** a signed-in Member unmarks a Final Hand Opponent
- **THEN** that Member stays checked as a Participant and their checkbox can be unchecked again

#### Scenario: No Final Hand Opponents are marked
- **WHEN** a signed-in Member saves a Tournament with no Final Hand Opponent marked
- **THEN** the form saves the Tournament without `finalHandOpponentIds`

### Requirement: The Leaderboard says what Played counts
The Leaderboard SHALL say that Played counts the Tournaments a Member was checked in as a Participant, since recording other Participants is optional.

#### Scenario: Viewing the Leaderboard
- **WHEN** anyone views the Leaderboard
- **THEN** it shows a note that Played counts the Tournaments a Member was checked in
