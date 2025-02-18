import api from './api';
import { toast } from 'react-hot-toast';

const attendanceService = {
  // Scan ticket QR code
  scanTicket: async (qrData) => {
    try {
      if (!qrData?.ticketId || !qrData?.ticketNumber) {
        throw new Error('Invalid QR code format');
      }

      const response = await api.post('/attendance/scan', {
        ticketId: qrData.ticketId,
        ticketNumber: qrData.ticketNumber
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to scan ticket';
      throw error;
    }
  },

  // Check in attendee
  checkInAttendee: async (ticketId) => {
    try {
      if (!ticketId) {
        throw new Error('Ticket ID is required');
      }

      const response = await api.post('/attendance/check-in', { ticketId });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to check in attendee';
      throw error;
    }
  },

  // Check out attendee
  checkOutAttendee: async (ticketId) => {
    try {
      if (!ticketId) {
        throw new Error('Ticket ID is required');
      }

      const response = await api.post('/attendance/check-out', { ticketId });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to check out attendee';
      throw error;
    }
  },

  // Get event attendance
  getEventAttendance: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const response = await api.get(`/attendance/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return {
        currentCount: 0,
        totalCheckins: 0,
        lastUpdated: new Date()
      };
    }
  },

  // Get checked-in attendees
  getCheckedInAttendees: async (eventId) => {
    try {
      const response = await api.get(`/attendance/event/${eventId}/attendees`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendees:', error);
      return [];
    }
  },

  // Get attendance history
  getAttendanceHistory: async (eventId) => {
    try {
      const response = await api.get(`/attendance/event/${eventId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      return [];
    }
  }
};

export default attendanceService; 