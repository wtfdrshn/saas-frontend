import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import FixedNavbar from '../components/layout/FixedNavbar';
import Footer from '../components/layout/Footer';
import { useLocation } from 'react-router-dom';
const PublicLayout = () => {
  const location = useLocation();
  const isEventsPage = location.pathname.startsWith('/events');
  const isCalendarPage = location.pathname.startsWith('/calendar');
  const isBudgetCalculatorPage = location.pathname.startsWith('/budget-calculator');
  return (
    <div className="min-h-screen flex flex-col">
      {isEventsPage || isCalendarPage || isBudgetCalculatorPage ? <FixedNavbar /> : <Navbar />}
      <main className="flex-grow bg-gray-50">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout; 