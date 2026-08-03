/** Create-form routes that take over the whole screen on mobile: the bottom
 * nav is hidden and the form card stretches to at least the viewport height,
 * with its buttons pinned to the bottom. Desktop is unaffected. */
const FULLSCREEN_FORM_ROUTES = [
  /^\/bikes\/new$/,
  /^\/bikes\/[^/]+\/components\/new$/,
  /^\/bikes\/[^/]+\/components\/[^/]+\/interventions\/new$/,
];

export function isFullscreenFormRoute(pathname: string) {
  return FULLSCREEN_FORM_ROUTES.some((re) => re.test(pathname));
}
