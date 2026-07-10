import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { Providers } from "@/components/shared/providers";
import { TranslationProvider } from "@/components/shared/translation-provider";
import { Toaster } from "@/components/ui/sonner";
import { detectLocale } from "@/lib/i18n/detect";
import { RTL_LOCALES } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Continental Bank — Private Client Portal",
    template: "%s · Continental Bank",
  },
  description:
    "Continental Bank — discreet, institutional-grade private wealth management for a global client base. Multi-currency accounts, executive service, and bank-level oversight.",
  keywords: [
    "private banking",
    "wealth management",
    "Continental Bank",
    "multi-currency",
    "private client portal",
  ],
  authors: [{ name: "Continental Bank" }],
  openGraph: {
    title: "Continental Bank — Private Client Portal",
    description:
      "Institutional-grade private banking. Discreet. Established. Globally accessible.",
    type: "website",
    locale: "en_US",
    siteName: "Continental Bank",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F1E8" },
    { media: "(prefers-color-scheme: dark)", color: "#07111F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await detectLocale();
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
        <TranslationProvider locale={locale} />
        <Toaster />
      </body>
    </html>
  );
}
