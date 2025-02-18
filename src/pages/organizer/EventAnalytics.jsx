import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  TicketIcon, 
  CurrencyRupeeIcon, 
  UserGroupIcon, 
  CalendarIcon
} from '@heroicons/react/24/outline';
import eventService from '../../services/eventService';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const EventAnalytics = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalTicketsSold: 0,
    totalRevenue: 0,
    averageTicketsPerBooking: 0,
    ticketsSoldByDate: [],
    bookingTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!eventId) {
        setError('No event ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching analytics for event:', eventId);
        
        const data = await eventService.getEventAnalytics(eventId);
        console.log('Received data:', data);
        
        if (!mounted) return;

        if (!data || !data.event) {
          throw new Error('Invalid data received from server');
        }

        setEvent(data.event);
        setAnalytics(data.analytics);
        setError(null);
      } catch (error) {
        console.error('Error in fetchEventAnalytics:', error);
        if (mounted) {
          setError(error.response?.data?.message || error.message || 'Failed to fetch analytics');
          toast.error('Failed to fetch analytics');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  console.log('Component render state:', {
    eventId,
    event,
    analytics,
    loading,
    error
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center p-8">
        <p>No event data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Event Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{event?.title}</h2>
        {/* <p className="text-gray-500">{event?.description}</p> */}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Total Tickets Sold */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TicketIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tickets Sold
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.totalTicketsSold}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{analytics.totalRevenue}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average Tickets per Booking */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg. Tickets/Booking
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.averageTicketsPerBooking.toFixed(1)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.bookingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tickets" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Sales */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Sales
        </h3>
        <div className="space-y-4">
          {analytics.ticketsSoldByDate.map((day, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-600">{day._id}</span>
              <span className="font-medium">{day.count} tickets</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics; 