import type { Metadata, Viewport } from "next";
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
  themeColor: "#05070a",
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
    <html lang="en">
      <body>
        <DashboardDataProvider>{children}</DashboardDataProvider>
        <ServiceWorkerReset />
      </body>
    </html>
  );
}
