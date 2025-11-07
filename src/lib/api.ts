import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { full_name: string; email: string; password: string }) =>
    api.post('/api/users/register/', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/api/token/', data),
};

// Activities API
export const activitiesAPI = {
  // Workouts
  getWorkouts: () => api.get('/api/activities/workouts/'),
  getWorkout: (id: number) => api.get(`/api/activities/workouts/${id}/`),
  createWorkout: (data: any) => api.post('/api/activities/workouts/', data),
  updateWorkout: (id: number, data: any) => api.put(`/api/activities/workouts/${id}/`, data),
  deleteWorkout: (id: number) => api.delete(`/api/activities/workouts/${id}/`),
  
  // Meals
  getMeals: () => api.get('/api/activities/meals/'),
  getMeal: (id: number) => api.get(`/api/activities/meals/${id}/`),
  createMeal: (data: any) => api.post('/api/activities/meals/', data),
  updateMeal: (id: number, data: any) => api.put(`/api/activities/meals/${id}/`, data),
  deleteMeal: (id: number) => api.delete(`/api/activities/meals/${id}/`),
  
  // Steps
  getSteps: () => api.get('/api/activities/steps/'),
  getStepsEntry: (id: number) => api.get(`/api/activities/steps/${id}/`),
  createSteps: (data: any) => api.post('/api/activities/steps/', data),
  updateSteps: (id: number, data: any) => api.put(`/api/activities/steps/${id}/`, data),
  deleteSteps: (id: number) => api.delete(`/api/activities/steps/${id}/`),
  
  // Choices
  getWorkoutChoices: () => api.get('/api/activities/workout-choices/'),
  getMealChoices: () => api.get('/api/activities/meal-choices/'),
  getStepsChoices: () => api.get('/api/activities/steps-choices/'),
};
