import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Lumen — AI Freelance Proposal & Cover Letter Assistant",
    template: "%s · Lumen",
  },
  description:
    "Win more freelance clients with AI. Generate high-converting proposals and personalized cover letters in seconds.",
  keywords: [
    "AI proposal generator",
    "freelance proposal AI",
    "cover letter AI",
    "Upwork proposal generator",
    "LinkedIn outreach AI",
  ],
  openGraph: {
    title: "Lumen — AI Freelance Proposal & Cover Letter Assistant",
    description: "Win more freelance clients with AI.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          theme="dark"
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(20, 22, 40, 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "white",
            },
          }}
        />
      </body>
    </html>
  );
}
