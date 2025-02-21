import api from "./api";

const paymentService = {
  createOrder: async (eventId, quantity) => {
    try {
      console.log('Creating order:', { eventId, quantity });
      const response = await api.post('/payments/create-order', {
        eventId,
        quantity
      });
      console.log('Order created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error.response?.data || error.message;
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/verify-payment', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTicketDetails: async (ticketId) => {
    try {
      const response = await api.get(`/payments/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserTickets: async () => {
    try {
      const response = await api.get('/payments/user/tickets');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default paymentService; 