import { useState } from 'react';

type MemberAvatarProps = {
  displayName: string;
  avatarUrl: string | null;
};

export function MemberAvatar({ displayName, avatarUrl }: MemberAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!avatarUrl || avatarUrl === failedUrl) {
    return <span className="member-avatar member-avatar-initial" data-initial={displayName.charAt(0)} aria-hidden="true" />;
  }

  return (
    <img
      className="member-avatar"
      src={avatarUrl}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailedUrl(avatarUrl)}
    />
  );
}
