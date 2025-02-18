import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1.05 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80"
          alt="Event"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </motion.div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <main className="max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl tracking-tight font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block">Create Unforgettable</span>{' '}
              <span className="block text-indigo-400 mt-2">Event Experiences</span>
            </h1>
            <p className="mt-3 text-sm text-gray-200 sm:mt-5 sm:text-base md:mt-5 md:text-lg mx-auto max-w-xl">
              Your all-in-one platform for event management. Create, manage, and sell tickets for your events with ease.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login/organizer"
                  className="flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-3 md:text-base md:px-8"
                >
                  Get Started
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/events"
                  className="flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-3 md:text-base md:px-8"
                >
                  Browse Events
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default HeroSection; 