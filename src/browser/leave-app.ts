/** Leaves the app for another site, such as Cognito's sign-out; a module of its own so tests can replace it. */
export const leaveApp = (url: string) => window.location.assign(url);
