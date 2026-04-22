import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Stretch Tent Configurator",
  description: "Frontend-Prototyp fuer einen Stretch-Tent-Konfigurator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
