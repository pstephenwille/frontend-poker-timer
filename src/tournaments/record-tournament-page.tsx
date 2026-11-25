import { ACCOUNT_CHECK_FAILED_MESSAGE, useCurrentMember } from '../members/current-member';
import { RegisterQrCode } from '../members/register-qr-code';
import { SignInLink } from '../members/sign-in-link';
import { RecordTournamentForm } from './record-tournament-form';

/** The host signs in on the timer's device while new players scan the code to register on theirs. */
function SignInToRecord() {
  return (
    <>
      <SignInLink className="sign-in-to-record">Sign in to record</SignInLink>
      <RegisterQrCode />
    </>
  );
}

function RecordTournamentContent() {
  const currentMember = useCurrentMember();

  if (currentMember.status === 'signedIn') return <RecordTournamentForm />;
  if (currentMember.status === 'signedOut') return <SignInToRecord />;
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
