export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  debt: number;
  totalOrders: number;
  totalSpent: number;
  createdAt?: string;
  lastOrder?: string;
}

export interface NewCustomerForm {
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

export interface CustomerFilters {
  status: "all" | "active" | "inactive";
}

export interface DebtPayment {
  id: number;
  customer_id: number;
  amount: number;
  description: string;
  created_at: string;
}

export interface CustomerActivity {
  id: number;
  type: "order" | "payment" | "credit";
  description: string;
  amount?: number;
  created_at: string;
}

export interface CustomerOrder {
  id: number;
  created_at: string;
  total: number;
  is_credit: boolean;
  items?: Array<{
    quantity: number;
    product_name: string;
    subtotal: number;
  }>;
}

export interface CustomerHistory {
  customer: Customer;
  activities: CustomerActivity[];
  orders: CustomerOrder[];
  debtPayments: DebtPayment[];
  totalOrders: number;
  totalSpent: number;
  currentDebt: number;
}