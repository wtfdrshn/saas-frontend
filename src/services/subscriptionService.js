import api from './api';

const getProfile = async () => {
  try {
    return await api.get('/organizers/me');
  } catch (error) {
    console.error('Failed to get profile:', error);
    throw error; // Re-throw to let the caller handle it
  }
}

const updateProfile = async (data) => {
  try {
    return await api.patch('/organizers/me', data);
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error; // Re-throw to let the caller handle it
  }
}

const getSubscription = async () => {
  try {
    const response = await api.get('/subscription/details')
    
    return response;

  } catch (error) {
    console.error('Failed to get subscription profile:', error);
    throw error;
  }
}

const createSubscriptionOrder = async (tier) => {
  try {
    return await api.post('/subscription/create', tier);
  } catch (error) {
    console.error('Failed to create subscription order:', error);
    throw error; // Re-throw to let the caller handle it
  }
}

const verifySubscription = async (data) => {
  try {
    const response = await api.post('/subscription/verify', data);
    
    console.log('Verification response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Verification failed');
    }
    
    return response.data;
  } catch (error) {
    console.error('Verification error details:', {
      response: error.response?.data,
      request: error.config,
      message: error.message
    });
    throw new Error(error.response?.data?.message || 'Payment verification failed. Please contact support.');
  }
}

export default {
  getProfile,
  updateProfile,
  createSubscriptionOrder,
  verifySubscription,
  getSubscription
}; 