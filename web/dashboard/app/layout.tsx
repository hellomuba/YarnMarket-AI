import './globals.css'
import type { ReactNode } from 'react'
import ClientLayout from './client-layout'

export const metadata = {
  title: 'YarnMarket AI Dashboard - 🇳🇬 Nigerian Conversational Commerce',
  description: 'AI-powered conversational commerce platform supporting local Nigerian languages and market dynamics',
  keywords: 'Nigeria, commerce, AI, chat, pidgin, marketplace, WhatsApp business',
  authors: [{ name: 'YarnMarket AI Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#10B981" />
      </head>
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
