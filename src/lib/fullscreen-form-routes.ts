/** Form routes that take over the whole screen on mobile: the bottom nav is
 * hidden and the form card stretches to fill the viewport, with its buttons
 * pinned to the bottom. Desktop is unaffected. */
const FULLSCREEN_FORM_ROUTES = [
  /^\/bikes\/new$/,
  /^\/bikes\/[^/]+\/edit$/,
  /^\/bikes\/[^/]+\/components\/new$/,
  /^\/bikes\/[^/]+\/components\/[^/]+\/edit$/,
  /^\/bikes\/[^/]+\/components\/[^/]+\/interventions\/new$/,
  /^\/bikes\/[^/]+\/components\/[^/]+\/interventions\/[^/]+\/edit$/,
];

export function isFullscreenFormRoute(pathname: string) {
  return FULLSCREEN_FORM_ROUTES.some((re) => re.test(pathname));
}
