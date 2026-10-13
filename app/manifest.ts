import type { MetadataRoute } from "next";

// The installable app's name, colours and icons. The theme and background match app/globals.css.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ResQfood",
    short_name: "ResQfood",
    description: "Good food. Second chances.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FBF8EE",
    theme_color: "#1F5C2E",
    lang: "en",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
