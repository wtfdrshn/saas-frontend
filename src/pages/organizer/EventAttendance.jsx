import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicketScanner from '../../components/scanner/TicketScanner';
import AttendanceCounter from '../../components/scanner/AttendanceCounter';
import AttendanceHistory from '../../components/scanner/AttendanceHistory';
import eventService from '../../services/eventService';
import attendanceService from '../../services/attendanceService';
import toast from 'react-hot-toast';

const EventAttendance = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('scanner'); // 'scanner' or 'history'

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await eventService.getEvent(eventId);
        setEvent(eventData);
        
        // Check event status and show appropriate message
        if (eventData.status !== 'ongoing') {
          toast.error(`Cannot manage attendance - event is ${eventData.status}`);
          navigate('/organizer/events');
          return;
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
        navigate('/organizer/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, navigate]);

  const handleScanComplete = async (result) => {
    if (result.success) {
      // Refresh attendance data
      await attendanceService.getEventAttendance(eventId);
    }
  };

  const getStatusBadgeClass = (status) => {
    const styles = {
      upcoming: 'bg-yellow-100 text-yellow-800',
      ongoing: 'bg-green-100 text-green-800',
      past: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-orange-100 text-orange-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage attendance for this event
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(event.status)}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setView('scanner')}
              className={`px-4 py-2 rounded-md ${
                view === 'scanner' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Scanner
            </button>
            <button
              onClick={() => setView('history')}
              className={`px-4 py-2 rounded-md ${
                view === 'history' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {event.status === 'ongoing' ? (
          <>
            <div className="mb-8">
              <AttendanceCounter eventId={eventId} />
            </div>

            {view === 'scanner' ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Scan Tickets
                </h2>
                <TicketScanner 
                  eventId={eventId} 
                  onScanComplete={handleScanComplete}
                />
              </div>
            ) : (
              <AttendanceHistory eventId={eventId} />
            )}
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">
              Attendance management is only available for ongoing events.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAttendance; 