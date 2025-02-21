import { createContext, useContext, useEffect, useState } from 'react';
import subscriptionService from '../services/subscriptionService';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await subscriptionService.getSubscription();
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };
    
    fetchSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext); 