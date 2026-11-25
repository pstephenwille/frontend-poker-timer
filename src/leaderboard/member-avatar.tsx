type MemberAvatarProps = {
  displayName: string;
  avatarUrl: string | null;
};

export function MemberAvatar({ displayName, avatarUrl }: MemberAvatarProps) {
  if (!avatarUrl) {
    return <span className="member-avatar member-avatar-initial" data-initial={displayName.charAt(0)} aria-hidden="true" />;
  }

  return <img className="member-avatar" src={avatarUrl} alt="" />;
}
