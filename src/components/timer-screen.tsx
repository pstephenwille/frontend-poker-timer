import { MainDisplay } from './main-display';

/** Stays mounted while other pages show, because the Level's clock lives in its components. */
export function TimerScreen({ isShown }: { isShown: boolean }) {
  return (
    <div className="timer-screen" hidden={!isShown}>
      <MainDisplay />
    </div>
  );
}
