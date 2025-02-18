import api from './api';

const profileService = {
  // User profile methods
  getUserProfile: async () => {
    try {
      const response = await api.get('/profile/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/profile/user', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Organizer profile methods
  getOrganizerProfile: async () => {
    try {
      const response = await api.get('/profile/organizer');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateOrganizerProfile: async (organizerData) => {
    try {
      const response = await api.put('/profile/organizer', organizerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Common profile picture upload method
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default profileService; 