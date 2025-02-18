import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import attendanceService from '../../services/attendanceService';

const EventManagement = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState({ currentCount: 0, totalCheckins: 0 });
  const [checkedInAttendees, setCheckedInAttendees] = useState([]);

  useEffect(() => {
    loadEventData();
    const interval = setInterval(loadEventData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  const loadEventData = async () => {
    try {
      const [eventData, attendanceData, attendeesList] = await Promise.all([
        eventService.getEvent(eventId),
        attendanceService.getEventAttendance(eventId),
        attendanceService.getCheckedInAttendees(eventId)
      ]);
      setEvent(eventData);
      setAttendance(attendanceData);
      setCheckedInAttendees(attendeesList);
    } catch (error) {
      toast.error('Error loading event data');
    }
  };

  const handleStartEvent = async () => {
    try {
      await eventService.updateEventStatus(eventId, 'ongoing');
      toast.success('Event started successfully');
      await loadEventData(); // Refresh the data
    } catch (error) {
      console.error('Error starting event:', error);
      toast.error(error.message || 'Failed to start event');
    }
  };

  const handleEndEvent = async () => {
    try {
      await eventService.updateEventStatus(eventId, 'past');
      toast.success('Event ended successfully');
      await loadEventData(); // Refresh the data
    } catch (error) {
      console.error('Error ending event:', error);
      toast.error(error.message || 'Failed to end event');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {event && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <div className="space-x-4">
              {event.status === 'upcoming' && (
                <button
                  onClick={handleStartEvent}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Start Event
                </button>
              )}
              {event.status === 'ongoing' && (
                <button
                  onClick={handleEndEvent}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  End Event
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Current Attendance</h2>
              <div className="text-4xl font-bold text-indigo-600">
                {attendance.currentCount}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Total Check-ins</h2>
              <div className="text-4xl font-bold text-indigo-600">
                {attendance.totalCheckins}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b">Checked-in Attendees</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {checkedInAttendees.map((attendee) => (
                    <tr key={attendee._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attendee.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(attendee.checkInStatus.checkedInAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventManagement; 