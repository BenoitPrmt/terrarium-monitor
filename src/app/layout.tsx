import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import {
    WEBSITE_URL,
    WEBSITE_NAME,
    WEBSITE_TAGLINE,
    WEBSITE_DESCRIPTION,
    WEBSITE_KEYWORDS,
    WEBSITE_CATEGORY,
    AUTHOR_NAME,
    AUTHOR_URL, GOOGLE_ANALYTICS_ID,
} from "@/constants/website";
import {GoogleAnalytics} from "@next/third-parties/google";
import {ThemeProvider} from "next-themes";

const outfitSans = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
    metadataBase: new URL(WEBSITE_URL),
    title: {
        default: `${WEBSITE_NAME} | ${WEBSITE_TAGLINE}`,
        template: `%s | ${WEBSITE_NAME}`
    },
    description: `${WEBSITE_DESCRIPTION}`,
    keywords: WEBSITE_KEYWORDS,
    authors: [{name: AUTHOR_NAME, url: AUTHOR_URL}],
    creator: `${AUTHOR_NAME}`,
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        url: WEBSITE_URL,
        title: `${WEBSITE_NAME} | ${WEBSITE_TAGLINE}`,
        description: `${WEBSITE_DESCRIPTION}`,
        siteName: `${WEBSITE_NAME}`,
        images: [
            {
                url: `${WEBSITE_URL}/images/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Image de couverture de ${WEBSITE_NAME}`,
            },
        ],
    },
    category: WEBSITE_CATEGORY,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${outfitSans.variable} antialiased`}
      >
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
        {children}
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
        <Toaster richColors closeButton/>
      </ThemeProvider>
      </body>
    </html>
  );
}
