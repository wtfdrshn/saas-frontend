import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, TicketIcon, UserIcon } from '@heroicons/react/24/outline';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const data = await paymentService.getTicketDetails(id);
      setTicket(data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch ticket details');
      navigate('/user/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const generateQRData = (ticket) => {
    return JSON.stringify({
      ticketId: ticket._id,
      eventId: ticket.event._id,
      ticketNumber: ticket.ticketNumber,
      quantity: ticket.quantity,
      isValid: ticket.isValid
    });
  };

  const downloadTicket = async () => {
    try {
      // Create a temporary container for the ticket
      const ticketElement = document.createElement('div');
      ticketElement.style.padding = '40px';
      ticketElement.style.background = 'white';
      ticketElement.style.width = '800px'; // Fixed width for better quality
      ticketElement.style.position = 'absolute';
      ticketElement.style.left = '-9999px'; // Hide the element
      
      // Add ticket content
      ticketElement.innerHTML = `
        <div style="font-family: Arial, sans-serif; border: 2px solid #4F46E5; border-radius: 12px; overflow: hidden;">
          <div style="background: #4F46E5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${ticket.event.title}</h1>
          </div>
          
          <div style="display: flex; padding: 20px;">
            <div style="flex: 1; padding: 20px; border-right: 1px solid #E5E7EB;">
              <div style="text-align: center;">
                ${document.querySelector('.qrcode')?.outerHTML || ''}
                <p style="margin-top: 10px; color: #6B7280; font-size: 14px;">
                  Ticket #${ticket.ticketNumber}
                </p>
              </div>
            </div>
            
            <div style="flex: 2; padding: 20px;">
              <div style="margin-bottom: 20px;">
                <p style="color: #6B7280; margin: 0;">Date</p>
                <p style="margin: 5px 0; font-weight: bold;">${formatDate(ticket.event.startDate)}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <p style="color: #6B7280; margin: 0;">Location</p>
                <p style="margin: 5px 0; font-weight: bold;">${ticket.event.location}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <p style="color: #6B7280; margin: 0;">Quantity</p>
                <p style="margin: 5px 0; font-weight: bold;">${ticket.quantity} ${ticket.quantity > 1 ? 'tickets' : 'ticket'}</p>
              </div>
              
              <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 20px;">
                <p style="color: #6B7280; margin: 0;">Total Amount</p>
                <p style="margin: 5px 0; font-weight: bold; color: #4F46E5;">₹${ticket.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Add to document temporarily
      document.body.appendChild(ticketElement);

      // Capture the element
      const canvas = await html2canvas(ticketElement, {
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary element
      document.body.removeChild(ticketElement);

      // Create download link
      const link = document.createElement('a');
      link.download = `ticket-${ticket.ticketNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket. Please try again.');
    }
  };

  const getQRCodeForDownload = () => {
    return (
      <QRCodeSVG
        value={generateQRData(ticket)}
        size={150}
        level="H"
        includeMargin={true}
        className="qrcode"
      />
    );
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

  const getTicketStatusMessage = (ticket) => {
    if (!ticket.isValid) {
      return {
        message: ticket.invalidationReason || 'This ticket has been invalidated',
        type: 'error'
      };
    }

    switch (ticket.event.status) {
      case 'cancelled':
        return {
          message: 'This event has been cancelled. Your ticket is no longer valid.',
          type: 'error'
        };
      case 'postponed':
        return {
          message: 'This event has been postponed. Please wait for further updates.',
          type: 'warning'
        };
      case 'past':
        return {
          message: 'This event has ended.',
          type: 'info'
        };
      case 'ongoing':
        return {
          message: 'This event is currently in progress.',
          type: 'success'
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Ticket Header with Status */}
          <div className="border-b border-gray-200 px-8 py-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
              {getStatusBadge(ticket.event.status, ticket.isValid)}
            </div>
            
            {/* Status Message */}
            {getTicketStatusMessage(ticket) && (
              <div className={`mt-4 p-4 rounded-md ${
                {
                  error: 'bg-red-50 text-red-800',
                  warning: 'bg-yellow-50 text-yellow-800',
                  info: 'bg-gray-50 text-gray-800',
                  success: 'bg-green-50 text-green-800'
                }[getTicketStatusMessage(ticket).type]
              }`}>
                <p>{getTicketStatusMessage(ticket).message}</p>
              </div>
            )}
          </div>

          {/* Existing ticket details section */}
          <div className="md:grid md:grid-cols-3 md:gap-6">
            {/* Left Column - QR Code */}
            <div className="p-8 border-r border-gray-100">
              <div className="flex flex-col items-center">
                <QRCodeSVG
                  value={generateQRData(ticket)}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="qrcode p-2 bg-white rounded-xl shadow-md"
                />
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Scan QR code for verification
                </p>
              </div>
            </div>

            {/* Middle & Right Columns - Event Details */}
            <div className="md:col-span-2 p-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                {ticket.event.title}
              </h3>

              {/* Event Information Grid */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(ticket.event.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{ticket.event.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <TicketIcon className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Ticket Number</p>
                      <p className="font-medium">#{ticket.ticketNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{ticket.quantity} {ticket.quantity > 1 ? 'tickets' : 'ticket'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Purchase Date</span>
                  <span className="font-medium">{formatDate(ticket.purchasedAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-sm bg-gray-50 px-3 py-1 rounded">{ticket.orderId}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-indigo-600">₹{ticket.totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={downloadTicket}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Download Ticket
                </button>
                <button
                  onClick={() => navigate('/user/dashboard')}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails; 