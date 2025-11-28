import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaNewz - Tech News Historical Intelligence",
  description: "AI-powered Tech News Historical Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

