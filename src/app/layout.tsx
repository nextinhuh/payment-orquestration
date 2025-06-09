import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'

const robotoSans = Roboto({
  variable: '--font-roboto-sans',
  subsets: ['latin'],
})
export const metadata: Metadata = {
  title: 'Payment Gateway',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${robotoSans.variable} ${robotoSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
