import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PMHS Viking Hub",
    short_name: "Viking Hub",
    description:
      "Pittsford Mendon High School Student & Family Navigation Hub — search clubs, AP & accelerated academic pathways, and interactive step-by-step student action guides.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#002855",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
