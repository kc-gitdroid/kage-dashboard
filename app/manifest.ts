import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kage Dashboard",
    short_name: "Kage",
    description: "A calm command center for brands, planning, and daily operations.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#05070a",
    theme_color: "#05070a",
    orientation: "portrait",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
