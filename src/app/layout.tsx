import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ColorThemeProvider } from '@/contexts/ColorThemeContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TappyOne CRM',
  description: 'Sistema de CRM com integração WhatsApp e IA',
  keywords: 'CRM, WhatsApp, IA, Atendimento, Kanban',
  authors: [{ name: 'TappyOne' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${poppins.className} antialiased`}>
        <ThemeProvider>
          <ColorThemeProvider>
            <div className="min-h-screen bg-background transition-colors duration-300">
              {children}
            </div>
          </ColorThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
