export interface Product {
  id: number;
  name: string;
  price: number;
  in_stock: number;
  category: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  debt: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface CreditSaleOrder {
  customerId: number;
  paymentMethodId: null;
  products: Array<{
    id: number;
    quantity: number;
    price: number;
  }>;
  total: number;
  isCreditSale: true;
}

export interface CreditSaleFilters {
  category: string;
  stockStatus: "all" | "in_stock" | "out_of_stock";
}