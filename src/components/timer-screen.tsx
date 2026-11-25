import { HonorCardsForTimer } from '../leaderboard/honor-cards-for-timer';
import { BlindsSchedule } from './blinds-schedule';
import { MainDisplay } from './main-display';

export function TimerScreen() {
  return (
    <>
      <MainDisplay />
      <div className="timer-footer">
        <BlindsSchedule />
        <HonorCardsForTimer />
      </div>
    </>
  );
}
