import { MAX_UPLOAD_BYTES } from '@pstephenwille/poker-timer-contracts';
import { me as ann, members } from '@pstephenwille/poker-timer-contracts/fixtures';
import { fireEvent, screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  acceptTournaments,
  failPhotoStorage,
  PHOTO_CONFIRM_URL,
  PHOTO_GRANT_FIELDS,
  PHOTO_GRANT_URL,
  PHOTO_STORAGE_URL,
  requestedUrls,
  requestsTo,
  serveLeaderboard,
  serveMembers,
  servePhotoUploads,
  signIn,
} from '../testing/fake-backend';
import {
  fillInEveryRequiredField,
  leaderboardShown,
  openRecordForm,
  potField,
  save,
  tournamentsPosted,
} from '../testing/record-tournament-form';

const PHOTO_FAILED_MESSAGE = "Tournament recorded. The photo didn't upload.";
const photo = new File(['photo bytes'], 'final-hand.png', { type: 'image/png' });

const photoField = () => screen.getByLabelText<HTMLInputElement>('Photo (optional)');
const tryAgain = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Try again' }));
const skipPhoto = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Skip photo' }));
const isPhotoRequest = (url: string) => [PHOTO_GRANT_URL, PHOTO_STORAGE_URL, PHOTO_CONFIRM_URL].includes(url);
const filePostedToStorage = (attempt = 0) => {
  const body = requestsTo(PHOTO_STORAGE_URL)[attempt]?.body;
  if (!(body instanceof FormData)) throw new Error(`Storage post ${attempt} had no form data`);

  return body;
};

async function saveWithPhoto(user: UserEvent) {
  await fillInEveryRequiredField(user);
  await user.upload(photoField(), photo);
  await save(user);
}

async function failThePhotoUpload() {
  failPhotoStorage();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const user = openRecordForm();
  await saveWithPhoto(user);
  await screen.findByText(PHOTO_FAILED_MESSAGE);

  return user;
}

beforeEach(() => {
  signIn(ann);
  serveMembers(members);
  acceptTournaments();
  servePhotoUploads();
  serveLeaderboard([]);
});

describe('saving with a photo', () => {
  test('records the Tournament, then gets an upload grant, posts the photo and confirms it, in that order', async () => {
    const user = openRecordForm();

    await saveWithPhoto(user);

    expect(await leaderboardShown()).toBeInTheDocument();
    expect(requestedUrls().filter((url) => url === '/api/tournaments' || isPhotoRequest(url)))
      .toEqual(['/api/tournaments', PHOTO_GRANT_URL, PHOTO_STORAGE_URL, PHOTO_CONFIRM_URL]);
    expect(JSON.parse(String(requestsTo(PHOTO_GRANT_URL)[0]?.body))).toEqual({ contentType: 'image/png' });
  });

  test("posts the grant's fields first and the photo last, as storage requires", async () => {
    const user = openRecordForm();

    await saveWithPhoto(user);

    await leaderboardShown();
    const formData = filePostedToStorage();
    expect([...formData.keys()]).toEqual([...Object.keys(PHOTO_GRANT_FIELDS), 'file']);
    expect(formData.get('key')).toBe(PHOTO_GRANT_FIELDS.key);
    expect(formData.get('file')).toBe(photo);
  });

  test('makes no upload calls without a photo', async () => {
    const user = openRecordForm();
    await fillInEveryRequiredField(user);

    await save(user);

    await leaderboardShown();
    expect(requestedUrls().filter(isPhotoRequest)).toEqual([]);
  });
});

describe('a photo that is refused before saving', () => {
  test('is not an image the backend accepts', async () => {
    const user = openRecordForm();
    await fillInEveryRequiredField(user);
    const animation = new File(['gif bytes'], 'celebration.gif', { type: 'image/gif' });

    fireEvent.change(photoField(), { target: { files: [animation] } });
    await save(user);

    expect(screen.getByRole('alert')).toHaveTextContent('The photo must be a JPEG, PNG, HEIC or WebP image.');
    expect(tournamentsPosted()).toEqual([]);
  });

  test('is larger than 10 MB', async () => {
    const user = openRecordForm();
    await fillInEveryRequiredField(user);
    const hugePhoto = new File(['x'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(hugePhoto, 'size', { value: MAX_UPLOAD_BYTES + 1 });

    await user.upload(photoField(), hugePhoto);
    await save(user);

    expect(screen.getByRole('alert')).toHaveTextContent('The photo must be 10 MB or smaller.');
    expect(tournamentsPosted()).toEqual([]);
  });
});

describe('a photo that fails to upload', () => {
  test('says the Tournament is recorded, locks the fields and never records it twice', async () => {
    const user = await failThePhotoUpload();

    expect(screen.getByRole('alert')).toHaveTextContent(PHOTO_FAILED_MESSAGE);
    expect(potField()).toBeDisabled();
    expect(photoField()).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();

    await tryAgain(user);

    expect(tournamentsPosted()).toHaveLength(1);
  });

  test('Try again uploads the same photo to the same Tournament, then shows the Leaderboard', async () => {
    const user = await failThePhotoUpload();
    servePhotoUploads();

    await tryAgain(user);

    expect(await leaderboardShown()).toBeInTheDocument();
    expect(requestsTo(PHOTO_GRANT_URL)).toHaveLength(2);
    expect(filePostedToStorage(1).get('file')).toBe(photo);
    expect(requestsTo(PHOTO_CONFIRM_URL)).toHaveLength(1);
  });

  test('Try again that fails again keeps the choice open', async () => {
    const user = await failThePhotoUpload();

    await tryAgain(user);

    expect(await screen.findByText(PHOTO_FAILED_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled();
  });

  test('Skip photo shows the Leaderboard', async () => {
    const user = await failThePhotoUpload();

    await skipPhoto(user);

    expect(await leaderboardShown()).toBeInTheDocument();
    expect(tournamentsPosted()).toHaveLength(1);
  });
});
