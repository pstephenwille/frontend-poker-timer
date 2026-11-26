import { fireEvent, render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MemberAvatar } from './member-avatar';

const PHOTO_URL = 'https://lh3.googleusercontent.com/a/photo';
const OTHER_PHOTO_URL = 'https://lh3.googleusercontent.com/a/other-photo';

function initialOf(container: HTMLElement) {
  return container.querySelector('.member-avatar-initial')?.getAttribute('data-initial');
}

describe('member avatar', () => {
  test('loads the photo without sending a referrer', () => {
    const { container } = render(<MemberAvatar displayName="Ann" avatarUrl={PHOTO_URL} />);

    const photo = container.querySelector('img');
    expect(photo).toHaveAttribute('src', PHOTO_URL);
    expect(photo).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  test('shows the initial when there is no photo', () => {
    const { container } = render(<MemberAvatar displayName="Ann" avatarUrl={null} />);

    expect(container.querySelector('img')).toBeNull();
    expect(initialOf(container)).toBe('A');
  });

  test('falls back to the initial when the photo fails to load', () => {
    const { container } = render(<MemberAvatar displayName="Ann" avatarUrl={PHOTO_URL} />);

    fireEvent.error(container.querySelector('img')!);

    expect(container.querySelector('img')).toBeNull();
    expect(initialOf(container)).toBe('A');
  });

  test('tries a new photo after an earlier one failed', () => {
    const { container, rerender } = render(<MemberAvatar displayName="Ann" avatarUrl={PHOTO_URL} />);
    fireEvent.error(container.querySelector('img')!);

    rerender(<MemberAvatar displayName="Ann" avatarUrl={OTHER_PHOTO_URL} />);

    expect(container.querySelector('img')).toHaveAttribute('src', OTHER_PHOTO_URL);
  });
});
