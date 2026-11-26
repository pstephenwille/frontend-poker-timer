import { Link, useLocation } from 'react-router';
import { LEADERBOARD_PATH, RECORD_TOURNAMENT_PATH, TIMER_PATH } from '../app-paths';
import { TimerExitLink } from './timer-exit-link';

const PAGES_IN_SITE_NAV = [
  { path: TIMER_PATH, label: 'Timer' },
  { path: LEADERBOARD_PATH, label: 'Leaderboard' },
  { path: RECORD_TOURNAMENT_PATH, label: 'Record' },
];

export function SiteNavLinks() {
  const { pathname } = useLocation();
  const isTimerShown = pathname === TIMER_PATH;
  const otherPages = PAGES_IN_SITE_NAV.filter(({ path }) => path !== pathname);

  return otherPages.map(({ path, label }) => isTimerShown
    ? <TimerExitLink key={path} to={path}>{label}</TimerExitLink>
    : <Link key={path} to={path}>{label}</Link>);
}
