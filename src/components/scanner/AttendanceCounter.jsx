import React, { useState, useEffect, useCallback } from 'react';
import attendanceService from '../../services/attendanceService';
import eventService from '../../services/eventService';

const AttendanceCounter = ({ eventId }) => {
  const [attendance, setAttendance] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEventAndAttendance = useCallback(async () => {
    try {
      setError(null);
      const [eventData, attendanceData] = await Promise.all([
        eventService.getEvent(eventId),
        attendanceService.getEventAttendance(eventId)
      ]);
      
      setEvent(eventData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    let intervalId;
    
    const initializeCounter = async () => {
      await fetchEventAndAttendance();
      
      // Only set up polling if event is ongoing
      if (event?.status === 'ongoing') {
        intervalId = setInterval(fetchEventAndAttendance, 30000);
      }
    };

    initializeCounter();

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchEventAndAttendance]);

  const getStatusBadge = () => {
    const styles = {
      ongoing: 'bg-green-100 text-green-800',
      upcoming: 'bg-yellow-100 text-yellow-800',
      past: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 text-sm rounded-full ${styles[event?.status]}`}>
        {event?.status.charAt(0).toUpperCase() + event?.status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Attendance Statistics</h2>
        {/* {getStatusBadge()} */}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Current Attendance</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {attendance?.currentCount || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Check-ins</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {attendance?.totalCheckins || 0}
          </p>
        </div>
      </div>

      {event?.status !== 'ongoing' && (
        <div className={`p-4 rounded-lg ${
          event?.status === 'upcoming' ? 'bg-yellow-50 text-yellow-800' : 'bg-gray-50 text-gray-800'
        }`}>
          <p>
            {event?.status === 'upcoming' 
              ? 'Attendance tracking will be available when the event starts.'
              : 'Attendance tracking is no longer available for this event.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceCounter; 