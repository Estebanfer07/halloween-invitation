import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  prerender: ["/"],
  // Router must match the path the site is served from (/halloween-invitation/).
  // Vite `base` stays "/" so asset paths are rewritten to the Pages prefix later.
  basename: "/halloween-invitation",
  // Disable lazy route discovery: it fetches a runtime /__manifest endpoint that
  // doesn't exist on static hosts like GitHub Pages, which breaks hydration.
  routeDiscovery: { mode: "initial" },
} satisfies Config;
