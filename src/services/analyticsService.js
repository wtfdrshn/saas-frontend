import api from './api';

const analyticsService = {
  // Get all dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/analytics/dashboard-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event-specific analytics
  getEventAnalytics: async (eventId) => {
    try {
      const response = await api.get(`/analytics/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recent events
  getRecentEvents: async () => {
    try {
      const response = await api.get('/analytics/recent-events');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recent tickets
  getRecentTickets: async () => {
    try {
      const response = await api.get('/analytics/recent-tickets');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales data
  getSalesData: async () => {
    try {
      const response = await api.get('/analytics/sales-data');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default analyticsService; 