import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCodeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import attendanceService from '../../services/attendanceService';
import eventService from '../../services/eventService';
import toast from 'react-hot-toast';

const AttendanceManagement = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getOrganizerEvents();
      
      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response format');
      }

      const eventsWithAttendance = await Promise.all(
        response.map(async (event) => {
          try {
            const attendanceData = await attendanceService.getEventAttendance(event._id);
            return { ...event, attendance: attendanceData };
          } catch (error) {
            console.error(`Error fetching attendance for event ${event._id}:`, error);
            return { ...event, attendance: { currentCount: 0, totalCheckins: 0 } };
          }
        })
      );

      setEvents(eventsWithAttendance);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError(error.message);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      upcoming: 'bg-yellow-100 text-yellow-800',
      ongoing: 'bg-green-100 text-green-800',
      past: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-orange-100 text-orange-800'
    };
    return styles[status] || styles.upcoming;
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'active') return event.status === 'ongoing';
    return event.status === filter;
  });

  const filterTabs = ['all', 'ongoing', 'upcoming', 'past', 'postponed', 'cancelled'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage attendance for all your events
            </p>
          </div>
        </div>

        <div className="mb-6">
          <nav className="flex space-x-4 flex-wrap" aria-label="Tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`${
                  filter === tab
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md capitalize mb-2`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid gap-6">
          {filteredEvents.map(event => (
            <div key={event._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusStyle(event.status)}`}>
                  {event.status}
                </span>
              </div>
              
              {event.status === 'ongoing' && (
                <Link
                  to={`/organizer/events/${event._id}/attendance`}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Manage Attendance
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement; 