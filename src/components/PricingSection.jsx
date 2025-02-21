import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Free',
    price: 0,
    features: [
      'Up to 5 events',
      'Basic analytics',
      'Email support',
      'Custom branding'
    ],
    limitations: [
      'No AI description generation',
      'No premium templates',
      'Limited attendee tracking'
    ]
  },
  {
    name: 'Pro',
    price: 29,
    features: [
      'Unlimited events',
      'Advanced analytics',
      'AI description generation',
      'Priority support',
      'Premium templates',
      'Full attendee tracking'
    ],
    limitations: []
  }
];

export default function PricingSection() {
  return (
    <div className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Pricing Plans
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Choose the plan that works best for your needs
          </p>
        </div>

        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
          {tiers.map((tier) => (
            <div key={tier.name} className="border border-gray-200 rounded-lg p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <p className="text-4xl font-extrabold text-indigo-600">
                  ${tier.price}<span className="text-xl text-gray-500">/mo</span>
                </p>
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900">Features</h4>
                <ul className="mt-4 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {tier.limitations.length > 0 && (
                  <>
                    <h4 className="mt-8 text-lg font-medium text-gray-900">Limitations</h4>
                    <ul className="mt-4 space-y-4">
                      {tier.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-start">
                          <XMarkIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
                          <span className="ml-3 text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              
              <div className="mt-8">
                {tier.name === 'Pro' ? (
                  <Link 
                    to="/subscription"
                    className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 block text-center"
                  >
                    Upgrade to Pro
                  </Link>
                ) : (
                  <button
                    className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700"
                  >
                    Choose {tier.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 