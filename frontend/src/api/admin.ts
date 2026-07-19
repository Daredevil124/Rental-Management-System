import { apiClient } from './client';
import type { DashboardSummary } from '../types/api';

export const adminApi = {
  // Dashboard
  getDashboardSummary: () => 
    apiClient.get<DashboardSummary>('/admin/dashboard/summary'),
    
  getRentalActivity: () => 
    apiClient.get('/admin/dashboard/rental-activity'),
    
  // Products & Inventory
  createProduct: (data: any) => apiClient.post('/admin/products', data),
  updateProduct: (id: string, data: any) => apiClient.patch(`/admin/products/${id}`, data),
  createVariant: (productId: string, data: any) => apiClient.post(`/admin/products/${productId}/variants`, data),
  createInventoryUnit: (data: any) => apiClient.post('/admin/inventory-units', data),
  
  // Pricing & Rules
  getRentalPeriods: () => apiClient.get('/pricing/rental-periods'),
  getPriceLists: () => apiClient.get('/admin/price-lists'),
  createPriceList: (data: any) => apiClient.post('/admin/price-lists', data),
  createLateFeeRule: (data: any) => apiClient.post('/admin/late-fee-rules', data),
  createDepositRule: (data: any) => apiClient.post('/admin/deposit-rules', data),
  createPricingRule: (data: any) => apiClient.post('/admin/pricing-rules', data),

  // Quotations
  getQuotations: () => apiClient.get('/admin/quotations'),
  getQuotationTemplates: () => apiClient.get('/admin/quotation-templates'),
  createQuotationTemplate: (data: any) => apiClient.post('/admin/quotation-templates', data),
  createQuotation: (data: any) => apiClient.post('/admin/quotations', data),
  confirmQuotation: (id: string) => apiClient.post(`/admin/quotations/${id}/confirm`),

  // Pickups/Returns
  getPickups: () => apiClient.get('/admin/pickups'),
  confirmPickup: (rentalId: string) => apiClient.post(`/admin/rentals/${rentalId}/confirm-pickup`),
  getReturns: () => apiClient.get('/admin/returns'),
  confirmReturn: (rentalId: string, data: any) => apiClient.post(`/admin/rentals/${rentalId}/confirm-return`, data),

  // Deposits & Late Fees
  getDeposits: () => apiClient.get('/admin/deposits'),
  getDepositHistory: (rentalId: string) => apiClient.get(`/admin/rentals/${rentalId}/deposit-history`),
  settleDeposit: (rentalId: string, data: any) => apiClient.post(`/admin/rentals/${rentalId}/settle-deposit`, data),

  // Users Management
  getUsers: () => apiClient.get('/users/admin'),
  approveVendor: (userId: string) => apiClient.patch(`/users/admin/${userId}/approve`),
};
