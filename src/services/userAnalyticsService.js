import api from './api';

const userAnalyticsService = {
  // Get user dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/analytics/user/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get user's upcoming events
  getUpcomingEvents: async () => {
    try {
      const response = await api.get('/analytics/user/upcoming-events');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Get user's ticket history
  getTicketHistory: async () => {
    try {
      const response = await api.get('/analytics/user/ticket-history');
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket history:', error);
      throw error;
    }
  },

  // Get user's event attendance history
  getEventAttendance: async () => {
    try {
      const response = await api.get('/analytics/user/event-attendance');
      return response.data;
    } catch (error) {
      console.error('Error fetching event attendance:', error);
      throw error;
    }
  },

  // Get user's spending analytics
  getSpendingAnalytics: async (timeframe = 'month') => {
    try {
      const response = await api.get(`/analytics/user/spending?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching spending analytics:', error);
      throw error;
    }
  },

  // Get user's favorite event categories
  getFavoriteCategories: async () => {
    try {
      const response = await api.get('/analytics/user/favorite-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorite categories:', error);
      throw error;
    }
  },

  // Get user's ticket usage stats
  getTicketUsageStats: async () => {
    try {
      const response = await api.get('/analytics/user/ticket-usage');
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket usage stats:', error);
      throw error;
    }
  }
};

export default userAnalyticsService; 