import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/miscUtils';

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; // Return empty string if invalid date
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const EventCard = ({ event }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden group"
    >
      <div className="relative">
        {/* Image with overlay on hover */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={event.coverImage} 
            alt={event.title}
            className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
        </div>

        {/* Category badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {event.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Date and Time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600 text-sm">{formatDate(event.startDate)}</span>
          </div>
          <span className="text-indigo-600 font-semibold">
            {formatPrice(event.price)}
          </span>
        </div>
        
        {/* Title and Description */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>
        <div dangerouslySetInnerHTML={{ __html: event.description }} className="text-gray-600 mb-4 line-clamp-2" />
        
        {/* Location and Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600 text-sm line-clamp-1">
              {event.location}
            </span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            View Details
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard; 