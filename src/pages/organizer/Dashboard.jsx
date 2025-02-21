import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import analyticsService from '../../services/analyticsService';
import {
  CalendarIcon,
  TicketIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  PlusIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import toast from 'react-hot-toast';
import { LockClosedIcon } from '@heroicons/react/20/solid';

import subscriptionService from '../../services/subscriptionService';
import profileService from '../../services/profileService';
// import organizerService from '../../services/organizerService';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEvents: 0,
      activeEvents: 0,
      totalTicketsSold: 0,
      revenue: 0
    },
    recentEvents: [],
    recentTickets: [],
    salesData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardStats();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentTickets();
  }, []);

  const fetchRecentTickets = async () => {
    try {
      const response = await analyticsService.getRecentTickets();
      setDashboardData(prevData => ({
        ...prevData,
        recentTickets: response
      }));
    } catch (error) {
      toast.error('Failed to fetch recent tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrganizerProfile = async () => {
      try {
        const response = await subscriptionService.getSubscription();
        console.log(response.data)
        const subData = response.data.subscription;
        const eventsCreated = response.data.eventsCreated;
          
        setSubscriptionData({
          tier: subData.tier || 'free',
          status: subData.status || 'active',
          eventLimit: subData.eventLimit || 5,
          expiresAt: subData.expiresAt,
          startedAt: subData.startedAt,
          remainingEvents: Math.max((subData.eventLimit || 5) - eventsCreated, 0)
        });
        
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast.error('Failed to load subscription details');
      }
    };
    
    fetchOrganizerProfile();
  }, []);

  const getStatusBadge = (status) => {
    if (!status) {
      return null;
    }

    const styles = {
      upcoming: 'bg-yellow-100 text-yellow-800',
      ongoing: 'bg-green-100 text-green-800',
      past: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats: dashboardStats, recentEvents, recentTickets, salesData } = dashboardData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
          Dashboard
        </h2>
        <button
          onClick={() => navigate('/organizer/events/create')}
          disabled={subscriptionData.remainingEvents <= 0}
          className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md ${
            subscriptionData.remainingEvents > 0
              ? 'text-white bg-indigo-600 hover:bg-indigo-700'
              : 'text-gray-300 bg-indigo-400 cursor-not-allowed'
          }`}
          title={subscriptionData.remainingEvents <= 0 ? 'Event limit reached - upgrade to create more' : ''}
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create Event
          {subscriptionData.remainingEvents <= 0 && (
            <LockClosedIcon className="ml-2 h-4 w-4" />
          )}
        </button>
      </div>

            {/* Subscription Status Card */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {subscriptionData.tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </h3>
            <p className={`text-sm ${
              subscriptionData.remainingEvents <= 0 
                ? 'text-red-600' 
                : 'text-gray-600'
            }`}>
              Events: {subscriptionData.remainingEvents}/{subscriptionData.eventLimit}
            </p>
            {subscriptionData.remainingEvents <= 0 && (
              <p className="text-sm text-red-500 mt-1">
                Event limit reached!
              </p>
            )}
          </div>
          
          {(subscriptionData.tier === 'free' || subscriptionData.remainingEvents <= 0) && (
            <Link
              to="/subscription"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm whitespace-nowrap"
            >
              {subscriptionData.tier === 'free' || subscriptionData.remainingEvents <= 0 ? 'Upgrade to Pro' : 'Renew Subscription'}
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Events */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardStats.totalEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Events */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Events</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardStats.activeEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Tickets */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TicketIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tickets Sold</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardStats.totalTicketsSold}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{dashboardStats.revenue.toLocaleString('en-IN')}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#4F46E5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Sales */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Sales</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tickets" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <Link
                key={event._id}
                to={`/organizer/events/${event._id}/analytics`}
                className="block hover:bg-gray-50 rounded-lg p-4 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {getStatusBadge(event.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tickets</h3>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div key={ticket._id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.eventTitle}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(ticket.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹{ticket.amount}</p>
                  <p className="text-sm text-gray-500">{ticket.quantity} tickets</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard; 