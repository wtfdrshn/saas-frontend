import api from './api';
import axios from 'axios';
// import { API_BASE_URL } from '../config';

const eventService = {
  // Get events with pagination and filters
  getEvents: async ({ page = 1, limit = 10, category, isActive, search }, retries = 3) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(search && { search }),
      });

      const response = await api.get(`/events?${params}`, {
        timeout: 5000 // 5 second timeout
      });
      return response.data;
    } catch (error) {
      console.error('Error in getEvents:', error.response || error);
      
      // Retry logic for network errors
      if (retries > 0 && (
        error.code === 'ECONNRESET' || 
        error.code === 'ECONNABORTED' ||
        error.message.includes('timeout')
      )) {
        console.log(`Retrying request, ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return eventService.getEvents({ page, limit, category, isActive, search }, retries - 1);
      }
      
      throw error;
    }
  },

  // Get single event
  getEvent: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      const data = response.data;
      
      // Format the data
      return {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags :
              typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()) :
              [],
        // Ensure dates are properly formatted
        // startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
        // endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : ''        
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  },

  // Create new event
  createEvent: async (formData, config = {}) => {
    try {
      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config
      });
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Update event
  updateEvent: async (id, formData) => {
    try {
      const response = await api.put(`/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEventAnalytics: async (eventId) => {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    try {
      const response = await api.get(`/events/${eventId}/analytics`);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getEventAnalytics:', {
        error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        throw new Error('Event not found');
      }
      
      throw error.response?.data?.message || error.message || 'Failed to fetch analytics';
    }
  },

  getOrganizerAnalytics: async () => {
    try {
      const response = await api.get('/analytics/organizer');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getOrganizerEvents: async () => {
    try {
      console.log('Fetching organizer events...');
      const response = await api.get('/events/organizer');
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      console.log('Received events:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching organizer events:', {
        error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        throw new Error('Not authorized to view events');
      }
      
      throw error.response?.data?.message || error.message || 'Failed to fetch events';
    }
  },

  updateEventStatus: async (eventId, status) => {
    try {
      const response = await api.patch(`/events/${eventId}/status`, { 
        status,
        manualStatusControl: true // Add this to enable manual control
      });
      return response.data;
    } catch (error) {
      console.error('Error updating event status:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default eventService; 