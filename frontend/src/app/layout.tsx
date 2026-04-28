import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KinetiCrypt — Digital Asset Provenance Engine",
  description:
    "Prove original ownership of your digital assets with cryptographic hashing and AI-powered visual analysis. Mint verifiable Certificates of Authenticity.",
  keywords: ["digital provenance", "certificate of authenticity", "SHA-256", "asset verification", "KinetiCrypt"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {/* Animated mesh background */}
        <div className="bg-mesh" />

        {/* Scan line effect */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.01) 2px, rgba(0,240,255,0.01) 4px)",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
