# Poker Timer

A blind clock for a home group's in-person Texas Hold'em tournaments, which also honors the group's winners.

## Language

### Play

**Tournament**:
One game of poker played in a single sitting, made up of many Hands, that ends when one player holds all the chips.
_Avoid_: Game (when meaning the whole sitting), session, match

**Hand**:
One deal of the cards, from posting the blinds to awarding that hand's chips; a Tournament is a sequence of Hands.
_Avoid_: Round, game, deal

**Level**:
A timed stage of the Tournament with a fixed small and big blind; when its time runs out the blinds go up to the next Level, and each Hand is played at the Level in effect when it was dealt.
_Avoid_: Round, blind period, hand

**Starting Blind**:
The small blind of the opening Level, chosen before the Tournament starts.
_Avoid_: Starting chips, starting stack

**Break**:
A rest from play of a set length, taken only once the Tournament has started, during which the Level's clock is stopped; it cannot be paused, only ended early, and when it ends play always resumes.
_Avoid_: Pause, intermission

**Color-up Break**:
The automatic Break after the Level whose small blind is 15, unless that is the opening Level, when the lowest-value chips are exchanged for higher ones.
_Avoid_: Colour-up (spelling), color-up round, chip-up

**Betting Round**:
One of the four rounds of betting within a Hand: pre-flop, flop, turn and river.
_Avoid_: Round (unqualified), street

**Member**:
A person with an account, which makes them part of the group; only Members can be recorded as playing.
_Avoid_: User, player (when meaning someone with an account), account

**Register**:
To become a Member by signing in for the first time; it is done once, not for each Tournament.
_Avoid_: Sign up, join, enroll

**Host**:
The Member who runs the timer at the table and records each Tournament when it ends.
_Avoid_: Admin (a separate role), dealer, organizer

**Participant**:
A Member who played in a given Tournament; the Winner always is one, and the others are optional when recording.
_Avoid_: Player (when meaning a recorded entrant), entrant, guest

### Outcome

**Winner**:
The one player who ends the Tournament holding all the chips; there are no other placements.
_Avoid_: Champion (when meaning any past winner), first place

**Final Hand**:
The last Hand of a Tournament, the one that leaves the Winner holding all the chips; it is the only Hand that is recorded.
_Avoid_: Final round, last round

**Final Hand Opponents**:
The members dealt into the Final Hand other than the Winner; optional when recording a Tournament.
_Avoid_: Final-round opponents, opponents (unqualified)

**Winning Hand**:
The category of five-card combination, from high card to royal flush, that the Winner held in the Final Hand.
_Avoid_: Winning round, best hand

**Pot**:
All the money in the Tournament: every player's Buy-in, which is on the table by the Final Hand and which the Winner takes in full.
_Avoid_: Prize, purse, payout, winnings (for a single Tournament)

**Buy-in**:
The money a player puts in to play a Tournament; together the Buy-ins make up the Pot.
_Avoid_: Entry fee, stake

**Last Winner**:
The Winner of the most recently played Tournament, honored for that one win until the next Tournament is recorded.
_Avoid_: Reigning Champion, latest champion, defending champ

**Leaderboard**:
Every member ranked by number of wins, with equal win counts separated by the strength of their Winning Hands, newest first, and any remaining tie going to the member who won most recently.
_Avoid_: Standings, rankings, scoreboard

**Reigning Champion**:
The member ranked first on the Leaderboard; it is a standing earned over many Tournaments, not a single win.
_Avoid_: Last Winner, leader, top player

## Flagged ambiguities

- "Round" has been used for a Level, a Hand and a Betting Round. It is retired as a bare word; use **Level**, **Hand** or **Betting Round**.
- "Hand" also means a player's cards or five-card combination (as in "winning hand: flush"). Hand on its own means the deal; the combination sense is always qualified, as **Winning Hand**.
