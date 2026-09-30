import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elimination Tracker",
    short_name: "Elimination",
    description:
      "Log food and symptoms and find the food compounds behind your symptoms.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2ea",
    theme_color: "#2f5d4a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
