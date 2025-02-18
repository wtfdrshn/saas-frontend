import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Link } from 'react-router-dom';
import api from '../services/api';

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');

      // Transform the events data to match FullCalendar format
      const formattedEvents = response.data.events.map(event => ({
        id: event._id,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        url: `/events/${event._id}`,
        backgroundColor: getEventColor(event.status),
        borderColor: getEventColor(event.status),
        textColor: 'black',
        extendedProps: {
          venue: event.venue,
          category: event.category,
          status: event.status
        }
      }));
      setEvents(formattedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
      setLoading(false);
    }
  };

  const getEventColor = (status) => {
    const colors = {
      upcoming: '#D6BCFA', // Light purple
      ongoing: '#9AE6B4', // Light green
      completed: '#CBD5E0', // Light gray
      cancelled: '#FEB2B2', // Light red
      postponed: '#FAF089'  // Light yellow
    };
    return colors[status] || '#D6BCFA';
  };

  const handleEventClick = (clickInfo) => {
    clickInfo.jsEvent.preventDefault();
    if (clickInfo.event.url) {
      window.location.href = clickInfo.event.url;
    }
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="p-1">
        <div className="font-semibold">{eventInfo.event.title}</div>
        <div className="text-xs">
          {eventInfo.event.extendedProps.venue}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchEvents}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
          <div className="mt-2 flex space-x-4">
            {['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'].map(status => (
              <div key={status} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2" 
                  style={{ backgroundColor: getEventColor(status) }}
                />
                <span className="text-sm capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          headerToolbar={{
            start: "title",
            center: "",
            end: "today prev,next",
          }}
          height="auto"
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          dayMaxEvents={true}
          eventDisplay="block"
          eventClassNames="cursor-pointer hover:opacity-90"
        />
      </div>
    </div>
  );
};

export default EventCalendar; 