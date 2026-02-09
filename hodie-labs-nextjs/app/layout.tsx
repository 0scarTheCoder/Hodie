import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@auth0/nextjs-auth0/client'

export const metadata: Metadata = {
  title: 'HodieLabs - AI-Powered Health Intelligence',
  description: 'Transform your health data into personalized insights with advanced AI analysis',
  keywords: 'health, AI, wellness, personalized medicine, health tracking',
  authors: [{ name: 'HodieLabs Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'HodieLabs - AI-Powered Health Intelligence',
    description: 'Transform your health data into personalized insights with advanced AI analysis',
    url: 'https://app.hodielabs.com',
    siteName: 'HodieLabs',
    type: 'website',
    images: [
      {
        url: '/hodie_labs_logo.png',
        width: 1200,
        height: 630,
        alt: 'HodieLabs Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HodieLabs - AI-Powered Health Intelligence',
    description: 'Transform your health data into personalized insights with advanced AI analysis',
    images: ['/hodie_labs_logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}