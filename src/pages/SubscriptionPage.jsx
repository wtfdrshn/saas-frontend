import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadRazorpay } from '../utils/razorpay.js';
import subscriptionService from '../services/subscriptionService.js';

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Pro',
      price: 2999,
      features: [
        'Unlimited events',
        'AI description generation',
        'Premium support',
        'Advanced analytics'
      ],
      duration: 'month'
    }
  ];

  const handleSubscription = async (tier) => {
    try {
      setLoading(true);
      setError('');

      // 1. Load Razorpay first
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // 2. Create order
      const { data: order } = await subscriptionService.createSubscriptionOrder(tier);

      // 3. Setup payment options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount.toString(),
        currency: 'INR',
        order_id: order.id,
        name: `${tier.name} Subscription`,
        description: `Pro Plan Subscription`,
        prefill: {
          name: order.user?.name || '',
          email: order.user?.email || '',
          contact: '9999999999'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
          }
        },
        config: {
          display: {
            hide_topbar: true
          }
        },
        handler: async (response) => {
          try {
            await subscriptionService.verifySubscription({
              ...response,
              plan: tier.name.toLowerCase()
            });
            navigate('/organizer/dashboard?subscription=success');
          } catch (err) {
            console.log(err)
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
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Choose Your Plan</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {tiers.map((tier) => (
          <div key={tier.name} className="border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{tier.name}</h2>
              <div className="text-3xl font-bold text-indigo-600">
                ₹{tier.price}<span className="text-lg text-gray-500">/{tier.duration}</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscription(tier)}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>

      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default SubscriptionPage; 