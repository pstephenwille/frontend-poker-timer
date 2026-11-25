import { HonorCardsForTimer } from '../leaderboard/honor-cards-for-timer';
import { BlindsSchedule } from './blinds-schedule';
import { MainDisplay } from './main-display';

/**
 * Stays mounted while other pages show, because the Level's clock lives in its
 * components; the honor cards mount each time it is shown, so they fetch afresh.
 */
export function TimerScreen({ isShown }: { isShown: boolean }) {
  return (
    <div className="timer-screen" hidden={!isShown}>
      <MainDisplay />
      <div className="timer-footer">
        <BlindsSchedule />
        {isShown && <HonorCardsForTimer />}
      </div>
    </div>
  );
}
