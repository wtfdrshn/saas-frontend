import React from 'react';
import HeroSection from '../components/home/HeroSection';
import EventsSection from '../components/home/EventsSection';
import PricingSection from '../components/PricingSection';

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <EventsSection />
      <PricingSection />
    </div>
  );
};

export default Home; 