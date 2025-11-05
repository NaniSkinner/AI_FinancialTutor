import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Common/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendSense Operator Dashboard",
  description:
    "Operator oversight interface for reviewing AI-generated financial recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthGuard>
            <ToastProvider>{children}</ToastProvider>
          </AuthGuard>
        </ErrorBoundary>
      </body>
    </html>
  );
}
