export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  in_stock: number;
  category: string;
}

export type Filters = {
  category: string;
  inStock: string;
};
