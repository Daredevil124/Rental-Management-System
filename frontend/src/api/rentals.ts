import { apiClient } from './client';
import type { RentalListResponse } from '../types/api';

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
  downloadInvoice: async (id: string) => {
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
    const response = await fetch(`${API_BASE_URL}/rentals/${id}/invoice/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Download failed');
    
    // Extract filename from Content-Disposition if present, or use fallback
    const disposition = response.headers.get('content-disposition');
    let filename = `Invoice_${id}.pdf`;
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};
