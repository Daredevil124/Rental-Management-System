import { apiClient } from './client';
import { DashboardSummary } from '../types/api';

export const adminApi = {
  // Dashboard
  getDashboardSummary: () => 
    apiClient.get<DashboardSummary>('/admin/dashboard/summary'),
    
  getRentalActivity: () => 
    apiClient.get('/admin/dashboard/rental-activity'),
    
  // Products
  createProduct: (data: any) => apiClient.post('/admin/products', data),
  updateProduct: (id: string, data: any) => apiClient.patch(`/admin/products/${id}`, data),
  
  // Pickups/Returns
  getPickups: () => apiClient.get('/admin/pickups'),
  confirmPickup: (rentalId: string) => apiClient.post(`/admin/rentals/${rentalId}/confirm-pickup`),
  
  getReturns: () => apiClient.get('/admin/returns'),
  confirmReturn: (rentalId: string, data: any) => apiClient.post(`/admin/rentals/${rentalId}/confirm-return`, data),
};
