export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  description: string;
  type: TransactionType;
  category: string;
  date: string;
  amount: number;
}

export interface NewTransactionForm {
  description: string;
  category: string;
  type: TransactionType;
  amount: string;
}