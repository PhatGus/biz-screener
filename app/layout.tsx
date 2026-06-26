import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "biz-screener — acquisition deal screener",
  description:
    "Screen small-business acquisition deals ($1.5M–$5M, DE/PA/MD corridor) into a structured deal memo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
