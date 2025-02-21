import { useState } from 'react';
import { loadRazorpay } from '../../utils/razorpay';
import paymentService from '../../services/paymentService';

const PaymentForm = ({ event, quantity, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Create order
      const orderResponse = await paymentService.createOrder({
        eventId: event._id,
        quantity
      });

      // Load Razorpay script
      await loadRazorpay();

      const options = {
        key: process.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        order_id: orderResponse.id,
        name: event.title,
        description: `Tickets for ${event.title}`,
        image: event.images[0] || '/logo.png',
        prefill: {
          name: orderResponse.user.name,
          email: orderResponse.user.email
        },
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              ...response,
              eventId: event._id,
              quantity
            });
            onSuccess();
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        theme: {
          color: '#2563eb'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Payment Summary</h3>
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span>Tickets ({quantity}x{event.ticketPrice})</span>
          <span>₹{(quantity * event.ticketPrice).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total Amount</span>
          <span>₹{(quantity * event.ticketPrice).toFixed(2)}</span>
        </div>
      </div>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>
      
      <p className="mt-4 text-sm text-gray-500">
        Secure payments powered by Razorpay
      </p>
    </div>
  );
};

export default PaymentForm; 