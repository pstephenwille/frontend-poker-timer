import { useCurrentMember } from '../members/current-member';
import { SignInLink } from '../members/sign-in-link';

const ACCOUNT_CHECK_FAILED_MESSAGE = "Couldn't check whether you're signed in. Reload the page to try again.";

function RecordTournamentForm() {
  return <form aria-label="Record a Tournament" />;
}

function RecordTournamentContent() {
  const currentMember = useCurrentMember();

  if (currentMember.status === 'signedIn') return <RecordTournamentForm />;
  if (currentMember.status === 'signedOut') return <SignInLink className="sign-in-to-record">Sign in to record</SignInLink>;
  if (currentMember.status === 'failed') return <p role="alert">{ACCOUNT_CHECK_FAILED_MESSAGE}</p>;

  return null;
}

/** Only a signed-in Member can record, so a signed-out visitor is sent to sign in and brought back to this same URL. */
export function RecordTournamentPage() {
  return (
    <main className="record-tournament-page">
      <h1>Record a Tournament</h1>
      <RecordTournamentContent />
    </main>
  );
}
