import { ThemeProvider } from '@/contexts/ThemeContext'

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
