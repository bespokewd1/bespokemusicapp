/** Wait for the account state before inviting visitors to join. */
export function showSongbookInvitation(ready: boolean, signedIn: boolean): boolean {
  return ready && !signedIn;
}