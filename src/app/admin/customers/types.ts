export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  debt: number;
  totalTransactions: number;
  totalSpent: number;
  createdAt?: string;
  lastTransaction?: string;
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
  type: "sale" | "payment" | "credit";
  description: string;
  amount?: number;
  created_at: string;
}

export interface CustomerTransaction {
  id: number;
  created_at: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  payment_method?: string;
}

export interface CustomerHistory {
  customer: Customer;
  activities: CustomerActivity[];
  transactions: CustomerTransaction[];
  debtPayments: DebtPayment[];
  totalTransactions: number;
  totalIncomeFromCustomer: number;
  currentDebt: number;
}