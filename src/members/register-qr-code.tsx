import { QRCodeSVG } from 'qrcode.react';
import { useId } from 'react';
import { ME_PATH } from '../app-paths';
import { signInUrl } from './sign-in-url';

const REGISTER_CAPTION = 'Not listed? Scan to register';
const QR_CODE_PIXELS = 160;

/**
 * Scanned by a player's own phone, so the URL is absolute, built from this site's origin.
 * The white padding around it, set in CSS, is the quiet zone scanners need on a dark page.
 */
export function RegisterQrCode() {
  const captionId = useId();
  const registerUrl = `${window.location.origin}${signInUrl(ME_PATH)}`;

  return (
    <figure className="register-qr-code" aria-labelledby={captionId}>
      <QRCodeSVG value={registerUrl} size={QR_CODE_PIXELS} title="Sign-in link for registering" />
      <figcaption id={captionId}>{REGISTER_CAPTION}</figcaption>
    </figure>
  );
}
