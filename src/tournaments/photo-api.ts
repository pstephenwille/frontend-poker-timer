import { ImageContentType, UploadGrant } from '@pstephenwille/poker-timer-contracts';

const photoUrl = (tournamentId: string) => `/api/tournaments/${tournamentId}/photo`;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function requestUploadGrant(tournamentId: string, contentType: ImageContentType): Promise<UploadGrant> {
  const url = `${photoUrl(tournamentId)}/uploads`;
  const response = await fetch(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ contentType }) });
  if (!response.ok) throw new Error(`POST ${url} answered ${response.status}`);

  return UploadGrant.parse(await response.json());
}

/** Storage checks the grant's policy against the fields before the file, so the file goes last. */
async function postToStorage(grant: UploadGrant, photo: File) {
  const formData = new FormData();
  Object.entries(grant.fields).forEach(([name, value]) => formData.append(name, value));
  formData.append('file', photo);

  const response = await fetch(grant.url, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Storage refused the photo upload with ${response.status}`);
}

async function confirmUpload(tournamentId: string, mediaId: string) {
  const url = photoUrl(tournamentId);
  const response = await fetch(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ mediaId }) });
  if (!response.ok) throw new Error(`POST ${url} answered ${response.status}`);
}

/** Only call with a photo that photoProblem accepted, so its type is one storage allows. */
export async function uploadTournamentPhoto(tournamentId: string, photo: File) {
  const contentType = ImageContentType.parse(photo.type);
  const grant = await requestUploadGrant(tournamentId, contentType);
  await postToStorage(grant, photo);
  await confirmUpload(tournamentId, grant.mediaId);
}
