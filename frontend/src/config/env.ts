/** Backend API configuration */
// export const API_BASE_URL = __DEV__
//   ? "http://10.0.0.202:8000"  // Development
//   : "http://10.0.0.202:8000";  // Production - update with your backend URL
export const API_BASE_URL = "https://receipt-lens-backend.onrender.com";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
  },
  RECEIPTS: {
    UPLOAD: "/receipts/upload",
    LIST: "/receipts",
    GET: (id: string) => `/receipts/${id}`,
  },
  TRANSACTIONS: {
    CREATE: "/transactions",
    LIST: "/transactions",
    GET: (id: string) => `/transactions/${id}`,
    DELETE: (id: string) => `/transactions/${id}`,
  },
  BUDGETS: {
    CREATE: "/budgets",
    LIST: "/budgets",
    DELETE: (id: string) => `/budgets/${id}`,
  },
  ANALYTICS: {
    MONTHLY_SPEND: "/analytics/monthly-spend",
    CATEGORY_BREAKDOWN: "/analytics/category-breakdown",
    BUDGET_ALERTS: "/analytics/budget-alerts",
    CURRENT_MONTH_SPEND: "/analytics/current-month-spend",
  },
};

