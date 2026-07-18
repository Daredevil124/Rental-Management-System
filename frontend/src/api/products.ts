import { apiClient } from './client';
import { ProductListResponse, ProductDetailResponse } from '../types/api';

export const productsApi = {
  getProducts: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get<ProductListResponse>(`/products${queryString}`);
  },
    
  getProduct: (id: string) => 
    apiClient.get<ProductDetailResponse>(`/products/${id}`),
};
