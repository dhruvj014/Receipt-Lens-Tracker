/** Type definitions for the application */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  image_path: string;
  vendor: string | null;
  purchase_date: string;
  total_amount: number;
  tax_amount: number;
  currency: string;
  category: string | null;
  raw_ocr_text: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  receipt_id: string | null;
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
  is_recurring: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string | null;
}

export interface MonthlySpendPoint {
  month: string;  // Format: "YYYY-MM"
  total_amount: number;
}

export interface CategorySpend {
  category: string;
  total_amount: number;
}

export interface BudgetAlert {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
  over_by: number;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TransactionCreate {
  amount: number;
  category: string;
  description?: string;
  transaction_date: string;
  is_recurring?: boolean;
}

export interface BudgetCreate {
  category: string;
  monthly_limit: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

