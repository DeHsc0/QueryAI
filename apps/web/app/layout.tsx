import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "../theme-provider"
import { TooltipProvider } from "../components/ui/tooltip"

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'QueryAI — Ask your data anything',
  description:
    'Connect your database, ask questions in plain English, and turn complex data into clear answers, SQL, and actionable insights.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ThemeProvider
          attribute={"class"}
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ClerkProvider>{children}</ClerkProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
