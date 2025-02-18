import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TicketIcon, CalendarIcon, ClockIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';
import paymentService from '../../services/paymentService';
import userAnalyticsService from '../../services/userAnalyticsService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTickets: 0,
    validTickets: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalQuantity: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    console.log('Tickets data:', tickets);
  }, [tickets]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, upcomingData, ticketsData] = await Promise.all([
        userAnalyticsService.getDashboardStats(),
        userAnalyticsService.getUpcomingEvents(),
        userAnalyticsService.getTicketHistory()
      ]);

      console.log('Received tickets data:', ticketsData);
      setStats(statsData.stats);
      setUpcomingEvents(upcomingData);
      setTickets(ticketsData);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
          Welcome back, {user?.name || 'User'}!
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {/* Total Bookings */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TicketIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalTickets}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Tickets (Quantity) */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalQuantity}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.upcomingEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Past Events */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Past Events</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pastEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Events</h3>
          <div className="mt-6">
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <Link 
                    to={`/user/tickets/${event._id}`} 
                    key={event._id} 
                    className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="relative h-48">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-500">
                          <CalendarIcon className="inline-block h-4 w-4 mr-1" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          <TicketIcon className="inline-block h-4 w-4 mr-1" />
                          {event.ticketQuantity} tickets
                        </p>
                        <p className="text-sm text-gray-500">
                          <MapPinIcon className="inline-block h-4 w-4 mr-1" />
                          {event.location}
                        </p>
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No upcoming events</div>
            )}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Your Purchased Tickets</h3>
          <div className="mt-6">
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : tickets.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <li key={ticket._id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {ticket.eventTitle}
                        </p>
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                          <span>Event Date: {new Date(ticket.startDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Ticket #{ticket.ticketNumber}</span>
                          <span>•</span>
                          <span>{ticket.quantity} {ticket.quantity > 1 ? 'tickets' : 'ticket'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          ₹{ticket.totalAmount}
                        </span>
                        {/* <span className={`px-2 py-1 text-xs rounded-full ${
                          new Date(ticket.startDate) > new Date()
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {new Date(ticket.startDate) > new Date() ? 'Valid' : 'Invalid'}
                        </span> */}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500">No tickets purchased yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 