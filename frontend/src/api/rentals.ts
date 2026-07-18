import { apiClient } from './client';
import { RentalListResponse } from '../types/api';

export const rentalsApi = {
  // Cart operations
  getCart: () => apiClient.get('/cart'),
  addToCart: (data: any) => apiClient.post('/cart/items', data),
  updateCartItem: (itemId: string, data: any) => apiClient.patch(`/cart/items/${itemId}`, data),
  removeCartItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
  
  // Checkout
  checkout: (data: any) => apiClient.post('/rentals/checkout', data),
  
  // Orders
  getMyRentals: () => apiClient.get<RentalListResponse>('/rentals'),
  getRental: (id: string) => apiClient.get(`/rentals/${id}`),
  getInvoice: (id: string) => apiClient.get(`/rentals/${id}/invoice`),
};
