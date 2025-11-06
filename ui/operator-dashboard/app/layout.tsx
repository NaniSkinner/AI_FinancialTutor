import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Common/Toast";
import { ThemeProvider } from "@/components/Common/ThemeProvider";
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
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('spendsense-theme');
                if (stored) {
                  const theme = JSON.parse(stored).state?.theme || 'light';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ErrorBoundary>
            <AuthGuard>
              <ToastProvider>{children}</ToastProvider>
            </AuthGuard>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
