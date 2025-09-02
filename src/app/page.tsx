import React from 'react'
import Header from '@/components/landing/Header'
import HeroSection from '@/components/landing/HeroSection'
import ServicesCarousel from '@/components/landing/ServicesCarousel'
import BenefitsSection from '@/components/landing/BenefitsSection'
import PricingSection from '@/components/landing/PricingSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import NewsletterCTA from '@/components/landing/NewsletterCTA'
import Footer from '@/components/landing/Footer'
import FloatingChat from '@/components/shared/FloatingChat'
import CookieConsent from '@/components/shared/CookieConsent'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <HeroSection />
      <div id="services">
        <ServicesCarousel />
      </div>
      <div id="benefits">
        <BenefitsSection />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <TestimonialsSection />
      <NewsletterCTA />
      <div id="footer">
        <Footer />
      </div>
      
      {/* Floating Components */}
      <FloatingChat />
      <CookieConsent />
    </div>
  )
}
