import api from './axios';
import { cookies } from '../utils/cookies';

const authService = {
  login: async (email, password) => {
    try {
      // FormData object to match API requirements
      const formData = new FormData();
      formData.append('email', email);
      // Properly encode password in base64
      const encodedPassword = btoa(unescape(encodeURIComponent(password)));
      formData.append('password', encodedPassword);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check if login was successful and we have user data
      if (response.data.code === 200 && response.data.data?.token) {
        const { token, ...userData } = response.data.data;
        cookies.setAuth(token.token, userData);
      }
      return response.data;
    } catch (error) {
      // Handle blocked account specifically
      if (error.response?.status === 403) {
        return {
          code: 403,
          message: error.response.data.message || 'Account has been blocked',
          data: null,
          errors: null
        };
      }
      // Return the error response in the same format as the API
      return error.response?.data || {
        code: 500,
        message: 'An error occurred during login',
        data: null,
        errors: null
      };
    }
  },

  signup: async (userData) => {
    try {
      // FormData object to match API requirements
      const formData = new FormData();
      formData.append('first_name', userData.firstName);
      formData.append('last_name', userData.lastName);
      formData.append('email', userData.email);
      formData.append('phone_number', userData.phone);
      
      // encode password in base64
      const encodedPassword = btoa(unescape(encodeURIComponent(userData.password)));
      formData.append('password', encodedPassword);
      formData.append('confirm_password', encodedPassword);

    

      const response = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.data?.token) {
        const { token, ...userData } = response.data.data;
        cookies.setAuth(token.token, userData);
      }
      return response.data;
    } catch (error) {
      // Improved error handling
      console.error('Registration error:', error.response?.data || error);
      return error.response?.data || {
        code: 500,
        message: 'An error occurred during signup',
        data: null,
        errors: error.message
      };
    }
  },

  logout: async () => {
    try {
      const token = cookies.getToken();
      
      const response = await api.get('/auth/logout', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      cookies.clearAuth();
      return response.data;
    } catch (error) {
      console.error('Logout error:', error); // Debug line
      cookies.clearAuth();
      return error.response?.data || {
        code: 500,
        message: 'An error occurred during logout',
        data: null,
        errors: null
      };
    }
  },

  getUserProfile: async () => {
    try {
      const token = cookies.getToken();
      
      if (!token) {
        return {
          code: 401,
          message: "No token passed",
          data: null,
          errors: null
        };
      }

      // Ensure token is properly formatted
      const formattedToken = token.trim();

      const response = await api.get('/user/get', {
        headers: {
          'Authorization': `Bearer ${formattedToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      console.error('Error response:', error.response);
      return error.response?.data || {
        code: 401,
        message: "No token passed",
        data: null,
        errors: null
      };
    }
  },

  getCurrentUser: () => {
    return cookies.getUserData();
  },

  isAuthenticated: () => {
    return !!cookies.getToken();
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      // FormData object to match API requirements
      const formData = new FormData();
      
      // Properly encode passwords in base64
      // const encodedCurrentPassword = btoa(unescape(encodeURIComponent(currentPassword)));
      // const encodedNewPassword = btoa(unescape(encodeURIComponent(newPassword)));
      // const encodedConfirmPassword = btoa(unescape(encodeURIComponent(confirmPassword)));
      
      formData.append('current_password', currentPassword);
      formData.append('password', newPassword);
      formData.append('confirm_password', confirmPassword);

      const response = await api.post('/user/changepassword', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${cookies.getToken()}`
        },
      });

      return response.data;
    } catch (error) {
      return error.response?.data || {
        code: 500,
        message: 'An error occurred while changing password',
        data: null,
        errors: null
      };
    }
  },

  // Send OTP to user's email for password reset
  forgetPassword: async (email) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      const response = await api.post('/auth/forgetpassword', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return error.response?.data || {
        code: 500,
        message: 'An error occurred during password reset request',
        data: null,
        errors: null
      };
    }
  },

  // Reset password with email, code, new password, and confirm password
  resetPassword: async (email, code, newPassword, confirmPassword) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('code', code);
      formData.append('password', newPassword);
      formData.append('confirm_password', confirmPassword);
      const response = await api.post('/auth/resetpassword', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return error.response?.data || {
        code: 500,
        message: 'An error occurred during password reset',
        data: null,
        errors: null
      };
    }
  }
};

export default authService;