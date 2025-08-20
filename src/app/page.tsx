import React from 'react'
import Header from '@/components/landing/Header'
import HeroSection from '@/components/landing/HeroSection'
import ServicesCarousel from '@/components/landing/ServicesCarousel'
import BenefitsSection from '@/components/landing/BenefitsSection'
import PricingSection from '@/components/landing/PricingSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import NewsletterCTA from '@/components/landing/NewsletterCTA'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <HeroSection />
      <ServicesCarousel />
      <BenefitsSection />
      <PricingSection />
      <TestimonialsSection />
      <NewsletterCTA />
      <Footer />
    </div>
  )
}
