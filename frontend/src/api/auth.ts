import { apiClient } from './client';
import type { AuthResponse, User } from '../types/api';

export const authApi = {
  login: (credentials: any) => 
    apiClient.post<AuthResponse>('/auth/login', credentials),
    
  register: (userData: any) => 
    apiClient.post<AuthResponse>('/auth/register', userData),
    
  getMe: () => 
    apiClient.get<{ data: User }>('/users/me'),
    
  updateMe: (userData: any) => 
    apiClient.patch<{ data: User }>('/users/me', userData),

  verifyEmail: (email: string) => 
    apiClient.post<{ data: { exists: boolean } }>('/auth/verify-email', { email }),
    
  resetPassword: (data: any) =>
    apiClient.post('/auth/reset-password', data),
};
