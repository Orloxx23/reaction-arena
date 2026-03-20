import type { Metadata } from "next";
import { Press_Start_2P, Silkscreen } from "next/font/google";
import { headers } from "next/headers";
import { I18nProvider, type Locale } from "@/shared/i18n";
import { GlitchOverlay } from "@/shared/components/glitch/glitch-overlay";
import "./globals.css";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: "400",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Reaction Time Arena",
  description:
    "Test your reflexes and compete with friends in real-time reaction speed battles.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;

  return (
    <html lang={locale} className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`min-h-dvh flex flex-col bg-background text-on-background font-body antialiased selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden ${pressStart.variable} ${silkscreen.variable}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <I18nProvider initialLocale={locale}>
          {children}
          <GlitchOverlay />
        </I18nProvider>
      </body>
    </html>
  );
}
