const SIGN_IN_URL = '/api/auth/login';

export const signInUrl = (returnTo: string) => `${SIGN_IN_URL}?${new URLSearchParams({ returnTo })}`;
