'use client'

import { useTheme } from '@/contexts/ThemeContext'
import Navigation from './components/Navigation'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import AboutSection from './components/AboutSection'
import PricingSection from './components/PricingSection'
import TestimonialsSection from './components/TestimonialsSection'
import Footer from './components/Footer'
import BackgroundPatterns from './components/BackgroundPatterns'

export default function LandingPage() {
  const { actualTheme } = useTheme()

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      actualTheme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'
    }`}>
      {/* Background Patterns */}
      <BackgroundPatterns />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <PricingSection />
        <TestimonialsSection />
        <Footer />
      </div>
    </div>
  )
}
