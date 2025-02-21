import api from './api';

const createOrder = (data) => api.post('/payments/create-order', data);
const verifyPayment = (data) => api.post('/payments/verify-payment', data);
const getTickets = () => api.get('/payments/user/tickets');

export default {
  createOrder,
  verifyPayment,
  getTickets
}; 