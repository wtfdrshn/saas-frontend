import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventTable from '../../components/events/EventTable';
import EventFilters from '../../components/events/EventFilters';
import eventService from '../../services/eventService';
// import DashboardLayout from '../../components/dashboard-layouts/DashboardLayout';
import { toast } from 'react-hot-toast';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: '',
    isActive: '',
    search: ''
  });
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events with filters:', filters);
      const data = await eventService.getEvents(filters);
      console.log('Received events data:', data);
      setEvents(data.events);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this event?')) {
        return;
      }

      setLoading(true);
      await eventService.deleteEvent(eventId);
      
      // Show success message
      toast.success('Event deleted successfully');
      
      // Refresh the events list
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (eventId) => {
    navigate(`/organizer/events/${eventId}/edit`);
  };

  const handleCreateEvent = () => {
    navigate('/organizer/events/create');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    // <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your events, create new ones, and track their performance.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateEvent}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <EventFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      <EventTable
        events={events}
        loading={loading}
        page={filters.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        />
      </div>
    // </DashboardLayout>
  );
};

export default Events; 