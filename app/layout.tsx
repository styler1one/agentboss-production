import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgentBoss Production Platform',
  description: 'Expert Matching & Agent Marketplace Platform',
  keywords: ['AI', 'Expert Matching', 'Agent Marketplace', 'AgentBoss'],
  authors: [{ name: 'AgentBoss Team' }],
  creator: 'AgentBoss',
  publisher: 'AgentBoss',
  robots: {
    index: false, // Set to true when ready for production
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}
