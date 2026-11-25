import { ACCOUNT_CHECK_FAILED_MESSAGE, useCurrentMember } from './current-member';
import { SignInLink } from './sign-in-link';

function MeContent() {
  const currentMember = useCurrentMember();

  if (currentMember.status === 'signedIn') {
    return (
      <p>
        You're registered, {currentMember.me.displayName}. The host can now check you on the Record form.
      </p>
    );
  }
  if (currentMember.status === 'signedOut') return <SignInLink className="sign-in-to-register">Sign in to register</SignInLink>;
  if (currentMember.status === 'failed') return <p role="alert">{ACCOUNT_CHECK_FAILED_MESSAGE}</p>;

  return null;
}

/** A placeholder where the register QR code lands, until the profile page is designed (slice 4). */
export function MePage() {
  return (
    <main className="me-page">
      <h1>Me</h1>
      <MeContent />
    </main>
  );
}
