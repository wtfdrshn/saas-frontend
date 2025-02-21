import api from "./api"

const worqhatService = {
  generateDescription: async (prompt) => {
    try {
      const response = await api.post('/worqhat/generate-description', { 
        prompt 
      });
      return response.data.description;
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to generate description');
    }
  }
};

export default worqhatService;