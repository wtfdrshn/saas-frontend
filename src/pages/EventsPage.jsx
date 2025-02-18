import React, { useState, useEffect } from 'react';
import EventCard from '../components/events/EventCard';
import eventService from '../services/eventService';
import { Link } from 'react-router-dom';

const EventsPage = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    priceRange: 'all'
  });

  const eventsPerPage = 6;
  const categories = ['Technology', 'Music', 'Sports', 'Arts', 'Business', 'Food'];
  const types = ['physical', 'virtual', 'hybrid'];

  // Fetch all events on component mount
  useEffect(() => {
    fetchAllEvents();
  }, []);

  // Apply filters whenever filters change or all events are loaded
  useEffect(() => {
    applyFilters();
  }, [filters, allEvents]);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({
        page: currentPage,
        limit: eventsPerPage,
      });
      setAllEvents(response.events || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEvents];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(event => 
        event.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(event => 
        event.type?.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Apply price filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(event => {
        if (filters.priceRange === 'free') {
          return event.price === 0 || event.price === null;
        } else {
          return event.price > 0;
        }
      });
    }

    // Update filtered events and total pages
    setFilteredEvents(filtered);
    setTotalPages(Math.ceil(filtered.length / eventsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Get current page events
  const getCurrentPageEvents = () => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  };

  return (
    <div className="container mx-auto px-4 mt-24">
      {/* Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:space-x-4">
        <input
          type="text"
          placeholder="Search events..."
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />

        <select
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg"
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg"
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
        >
          <option value="">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>

        <select
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg"
          value={filters.priceRange}
          onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
        >
          <option value="all">All Prices</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchAllEvents}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found matching your criteria.</p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {getCurrentPageEvents().map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === index + 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage; 