/** Public addresses only; authentication continues to use the current origin. */
export const SITE_URL = "https://bespokemusic.app";

export function siteUrl(path = "/") {
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}