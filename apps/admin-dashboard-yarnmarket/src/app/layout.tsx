import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Toaster } from 'sonner';
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "YarnMarket AI Dashboard",
  description: "Multi-tenant admin dashboard for YarnMarket AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body 
        className={`${inter.className} bg-slate-950 text-white antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
