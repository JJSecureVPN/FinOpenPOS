export interface User {
  id: string;
  email: string;
  role: 'admin' | 'cajero';
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

export interface NewUser {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'cajero';
}

export interface CurrentUser {
  user_id: string;
  email: string;
  role: string;
}

export interface UserFilters {
  role: "all" | "admin" | "cajero";
  status: "all" | "verified" | "unverified";
  activity: "all" | "active" | "inactive";
}

export interface UserStats {
  totalUsers: number;
  adminUsers: number;
  cajeroUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}