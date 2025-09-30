import type { Metadata } from "next";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ocw-rewrite",
  description: "ocw-rewrite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <Providers>
            <div className="grid bg-background grid-rows-[auto_1fr] h-screen">
              <NuqsAdapter>{children}</NuqsAdapter>
            </div>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
