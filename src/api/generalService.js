import api from './axios';

const generalService = {
  getPolicyAndTerms: async () => {
    try {
      const response = await api.get('/content/tcp');
      return response.data;
    } catch (error) {
      return error.response?.data || {
        code: 500,
        message: 'Error fetching policy and terms',
        data: null,
        errors: error.response?.data?.errors || ['Failed to fetch policy and terms']
      };
    }
  },
  getCommonContent: async () => {
    try {
      const response = await api.get('/content/common');
      return response.data;
    } catch (error) {
      return error.response?.data || {
        code: 500,
        message: 'Error fetching common content',
        data: null,
        errors: error.response?.data?.errors || ['Failed to fetch common content']
      };
    }
  }
};

export default generalService; 