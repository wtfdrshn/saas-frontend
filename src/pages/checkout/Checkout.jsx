import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const data = await eventService.getEvent(eventId);
      console.log(data);
      setEvent(data);
    } catch (error) {
      toast.error(error.message);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // Create order
      const orderData = await paymentService.createOrder(eventId, quantity);

      // If it's a free event, redirect to ticket page directly
      if (orderData.isFree) {
        toast.success('Free ticket created successfully!');
        navigate(`/user/tickets/${orderData.ticket._id}`);
        return;
      }

      // For paid events, continue with Razorpay
      const options = {
        key: import.meta.env.RAZORPAY_KEY_ID,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: event.title,
        description: `${quantity} ticket(s) for ${event.title}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verificationData = await paymentService.verifyPayment({
              ...response,
              eventId,
              quantity
            });

            toast.success('Ticket created successfully!');
            navigate(`/user/tickets/${verificationData.ticket._id}`);
          } catch (error) {
            toast.error('Payment verification failed');
            navigate('/payment/failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setProcessing(false);
      toast.error(error.message || 'Failed to process request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>
          
          {/* Event Details */}
          <div className="mb-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{event.title}</h3>
              <p className="text-gray-600">{event.description}</p>
            </div>

            {/* Event Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              {/* Date & Time */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                <div className="space-y-1">
                  <p className="text-gray-900">
                    <span className="font-medium">Starts:</span>{' '}
                    {new Date(event.startDate).toLocaleString()}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Ends:</span>{' '}
                    {new Date(event.endDate).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p className="text-gray-900">{event.location}</p>
                </div>
              )}

              {/* Virtual Event Link */}
              {event.virtualLink && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Virtual Event</h4>
                  <p className="text-gray-900">Link will be provided after purchase</p>
                </div>
              )}

              {/* Category */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Category</h4>
                <p className="text-gray-900">{event.category}</p>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Organized by</h4>
              <div className="flex items-center space-x-3">
                {event.organizer.profilePicture && (
                  <img 
                    src={event.organizer.profilePicture} 
                    alt={event.organizer.organizationName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-gray-900 font-medium">{event.organizer.organizationName}</p>
                  <p className="text-gray-500 text-sm">{event.organizer.email}</p>
                </div>
              </div>
            </div>

            {/* Price Information */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-gray-900 mb-4">
                <span>Ticket Price:</span>
                <span>₹{event.price}</span>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Amount */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{event.price * quantity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {processing 
              ? 'Processing...' 
              : event.price === 0 || event.isFree 
                ? 'Register Now' 
                : 'Proceed to Payment'
            }
          </button>

          {/* Cancellation Policy */}
          <p className="mt-4 text-sm text-gray-500 text-center">
            By proceeding with the payment, you agree to our terms and conditions.
            Tickets once purchased cannot be cancelled or refunded.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 