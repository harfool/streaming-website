import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => 
    apiClient.post('/user/login', { email, password }),
  
  register: (username, email, password) => 
    apiClient.post('/user/register', { username, email, password }),
  
  getProfile: () => 
    apiClient.get('/user/profile'),
  
  logout: () => 
    apiClient.post('/user/logout'),
};

// Video API calls
export const videoAPI = {
  getAllVideos: () => 
    apiClient.get('/video/all'),
  
  getVideo: (id) => 
    apiClient.get(`/video/${id}`),
  
  uploadVideo: (formData) => 
    apiClient.post('/video/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteVideo: (id) => 
    apiClient.delete(`/video/${id}`),
  
  updateVideo: (id, data) => 
    apiClient.patch(`/video/${id}`, data),
};

// Comment API calls
export const commentAPI = {
  getComments: (videoId) => 
    apiClient.get(`/comment/${videoId}`),
  
  addComment: (videoId, text) => 
    apiClient.post('/comment', { videoId, text }),
  
  deleteComment: (id) => 
    apiClient.delete(`/comment/${id}`),
  
  updateComment: (id, text) => 
    apiClient.patch(`/comment/${id}`, { text }),
};

// Like API calls
export const likeAPI = {
  toggleLike: (videoId) => 
    apiClient.post('/like', { videoId }),
  
  getLikes: (videoId) => 
    apiClient.get(`/like/${videoId}`),
};

// Subscription API calls
export const subscriptionAPI = {
  subscribe: (userId) => 
    apiClient.post('/subscription', { userId }),
  
  unsubscribe: (userId) => 
    apiClient.delete(`/subscription/${userId}`),
  
  getSubscriptions: () => 
    apiClient.get('/subscription'),
  
  getSubscribers: () => 
    apiClient.get('/subscription/subscribers'),
};

// Playlist API calls
export const playlistAPI = {
  getPlaylists: () => 
    apiClient.get('/playlist'),
  
  createPlaylist: (name, description) => 
    apiClient.post('/playlist', { name, description }),
  
  getPlaylist: (id) => 
    apiClient.get(`/playlist/${id}`),
  
  updatePlaylist: (id, data) => 
    apiClient.patch(`/playlist/${id}`, data),
  
  deletePlaylist: (id) => 
    apiClient.delete(`/playlist/${id}`),
  
  addVideoToPlaylist: (playlistId, videoId) => 
    apiClient.post(`/playlist/${playlistId}/videos`, { videoId }),
  
  removeVideoFromPlaylist: (playlistId, videoId) => 
    apiClient.delete(`/playlist/${playlistId}/videos/${videoId}`),
};

// Dashboard API calls
export const dashboardAPI = {
  getDashboard: () => 
    apiClient.get('/dashboard'),
  
  getStats: () => 
    apiClient.get('/dashboard/stats'),
};

// Tweet API calls (if implemented)
export const tweetAPI = {
  getTweets: () => 
    apiClient.get('/tweet'),
  
  createTweet: (content) => 
    apiClient.post('/tweet', { content }),
  
  deleteTweet: (id) => 
    apiClient.delete(`/tweet/${id}`),
  
  updateTweet: (id, content) => 
    apiClient.patch(`/tweet/${id}`, { content }),
};

export default apiClient;
