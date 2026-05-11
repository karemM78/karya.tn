import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = BASE_URL.replace('/api', '');

const API = axios.create({
  baseURL: BASE_URL,
});

export { BASE_URL, BACKEND_URL };

// Add token to requests
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  if (userInfo && userInfo.token) {
    req.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return req;
});

// User Auth
export const login = (email, password) => API.post('/users/login', { email, password });
export const signup = (userData) => API.post('/users', userData);
export const googleLogin = (tokenId) => API.post('/users/google', { tokenId });
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (userData) => API.put('/users/profile', userData);
export const getUserById = (id) => API.get(`/users/public/${id}`);
export const uploadAvatar = (formData) => API.post('/users/upload-avatar', formData);
export const forgotPassword = (email) => API.post('/users/forgot-password', { email });
export const resetPassword = (token, password) => API.post(`/users/reset-password/${token}`, { password });

// Properties
export const getProperties = (userId) => API.get(`/properties${userId ? `?userId=${userId}` : ''}`);
export const getProperty = (id) => API.get(`/properties/${id}`);
export const createProperty = (propertyData) => API.post('/properties', propertyData);
export const updateProperty = (id, propertyData) => API.put(`/properties/${id}`, propertyData);
export const deleteProperty = (id) => API.delete(`/properties/${id}`);
export const uploadImages = (formData) => API.post('/properties/upload', formData);


// Social
export const followUser = (id) => API.post(`/social/follow/${id}`);
export const unfollowUser = (id) => API.post(`/social/unfollow/${id}`);
export const getSocialStats = (id) => API.get(`/social/stats/${id}`);
export const likeProperty = (id) => API.post(`/social/like/${id}`);
export const rateOwner = (id, ratingData) => API.post(`/social/rate/${id}`, ratingData);

// Messages
export const getInbox = () => API.get('/messages/inbox/all');
export const getConversation = (userId) => API.get(`/messages/${userId}`);
export const sendMessage = (messageData) => API.post('/messages', messageData);
export const getUnreadMessageCount = () => API.get('/messages/unread/count');
export const uploadChatMedia = (formData) => API.post('/messages/upload', formData);

// Comments
export const getComments = (propertyId) => API.get(`/comments/${propertyId}`);
export const postComment = (commentData) => API.post('/comments', commentData);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = () => API.get('/admin/users');
export const updateAdminUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const deleteAdminUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminListings = () => API.get('/admin/listings');
export const updateAdminListingStatus = (id, status) => API.put(`/admin/listings/${id}/status`, { status });
export const deleteAdminListing = (id) => API.delete(`/admin/listings/${id}`);

export default API;
