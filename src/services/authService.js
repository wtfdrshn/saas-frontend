import api from './api';

const authService = {
  loginUser: async (email, password) => {
    try {
      const response = await api.post('/auth/login/user', { email, password });
      console.log("response from authService", response);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerUser: async (userData) => {
    try {
      const response = await api.post('/auth/register/user', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  loginOrganizer: async (email, password) => {
    try {
      const response = await api.post('/auth/login/organizer', { email, password });
      if (response.data.message === 'OTP sent to your email') {
        return response.data;
      }
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          ...response.data.organizer,
          role: 'organizer'
        }));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerOrganizer: async (organizerData) => {
    try {
      const response = await api.post('/auth/register/organizer', organizerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyOTP: async (otp, email) => {
    try {
      const response = await api.post('/auth/verify-otp', { otp, email });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          ...response.data.organizer,
          role: 'organizer'
        }));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resendOTP: async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      console.log("user from authService", user);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkSession: async () => {
    try {
      const response = await api.get('/auth/check-session');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService; 