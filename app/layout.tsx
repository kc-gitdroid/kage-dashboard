import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-mono/700.css";
import { DashboardDataProvider } from "@/components/providers/dashboard-data-provider";
import ServiceWorkerReset from "@/components/service-worker-reset";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kage Dashboard",
  description: "A calm command center for brands, planning, and daily operations.",
  icons: {
    icon: "/icon?size=512",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f2eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const theme = localStorage.getItem("kage-dashboard-theme") === "dark" ? "dark" : "light"; document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; } catch { document.documentElement.dataset.theme = "light"; } })();`,
          }}
        />
      </head>
      <body>
        <DashboardDataProvider>{children}</DashboardDataProvider>
        <ServiceWorkerReset />
      </body>
    </html>
  );
}
