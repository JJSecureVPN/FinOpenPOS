export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  in_stock: number;
};

export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = {
  id: string;
  name: string;
  enabled: boolean;
};