// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface AuthResponse {
  data: {
    token: string;
    user: User;
  }
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
}

export interface ProductListResponse {
  data: Product[];
}

export interface ProductDetailResponse {
  data: Product;
}

// Rental/Order Types
export interface RentalOrder {
  id: string;
  userId: string;
  status: 'pending' | 'active' | 'completed' | 'overdue';
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface RentalListResponse {
  data: RentalOrder[];
}

export interface DashboardSummary {
  data: {
    activeRentals: number;
    dueToday: number;
    overdue: number;
    revenueToday: number;
    upcomingPickups: number;
    upcomingReturns: number;
    rentalRevenue: number;
    securityDepositsHeld: number;
    lateFeeCollection: number;
  }
}
