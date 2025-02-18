import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      const response = await paymentService.getUserTickets();
      setTickets(response);
      console.log(response);
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, isValid) => {
    const styles = {
      upcoming: 'bg-yellow-100 text-yellow-800',
      ongoing: 'bg-green-100 text-green-800',
      past: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-orange-100 text-orange-800'
    };

    if (!isValid) {
      return (
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          Ticket Invalid
        </span>
      );
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tickets Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Your Tickets</h3>
        </div>
        
        {loading ? (
          <div className="p-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : tickets.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <li key={ticket._id}>
                <Link 
                  to={`/user/tickets/${ticket._id}`} 
                  className="block py-4 px-4 hover:bg-gray-50 transition duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.eventTitle}
                      </p>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <span>Event Date: {format(new Date(ticket.event.startDate), 'PPP')}</span>
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
                      {getStatusBadge(ticket.event.status, ticket.isValid)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500">No tickets purchased</div>
        )}
      </div>
    </div>
  );
};

export default MyTickets; 