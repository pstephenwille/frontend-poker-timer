import { SigninErrorCode } from '@pstephenwille/poker-timer-contracts';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

const SIGNIN_ERROR_PARAM = 'signinError';
const REF_PARAM = 'ref';

const MESSAGE_BY_CODE: Record<SigninErrorCode, string> = {
  cancelled: 'Sign-in was cancelled.',
  expired: 'Sign-in took too long. Please try again.',
  deactivated: 'This account has been deactivated. Ask an admin to reactivate it.',
  failed: 'Sign-in failed. Please try again.',
};

/** Only an unexplained failure shows the ref: it is what an admin needs to find the reason in the backend's log. */
function describeSigninError(searchParams: URLSearchParams): string | null {
  const code = SigninErrorCode.safeParse(searchParams.get(SIGNIN_ERROR_PARAM));
  if (!code.success) return null;

  const ref = searchParams.get(REF_PARAM);
  const message = MESSAGE_BY_CODE[code.data];

  return code.data === 'failed' && ref ? `${message} (ref: ${ref})` : message;
}

/** The backend sends a failed sign-in back to the app with a code and ref in the URL; they are shown once, then removed. */
export function SigninErrorBanner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState(() => describeSigninError(searchParams));

  useEffect(function removeSigninErrorFromUrl() {
    if (!searchParams.has(SIGNIN_ERROR_PARAM)) return;

    setSearchParams((params) => {
      params.delete(SIGNIN_ERROR_PARAM);
      params.delete(REF_PARAM);

      return params;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  if (!message) return null;

  return (
    <div className="signin-error" role="alert">
      <p>{message}</p>
      <button onClick={() => setMessage(null)}>Dismiss</button>
    </div>
  );
}
