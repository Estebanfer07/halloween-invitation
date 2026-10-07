import type { Config } from "@react-router/dev/config";

export default {
  // Prerender to a static index.html so GitHub Pages serves a fully rendered page
  ssr: true,
  prerender: ["/"],
} satisfies Config;
