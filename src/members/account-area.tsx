import { AccountMenu } from './account-menu';
import { useCurrentMember } from './current-member';
import { SignInLink } from './sign-in-link';

export function AccountArea() {
  const currentMember = useCurrentMember();

  if (currentMember.status === 'signedIn') return <AccountMenu me={currentMember.me} />;
  if (currentMember.status === 'signedOut') return <SignInLink className="sign-in">Sign in</SignInLink>;

  return null;
}
