/** Hooks for analytics data */
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";
import { API_ENDPOINTS } from "../config/env";
import { MonthlySpendPoint, CategorySpend, BudgetAlert } from "../types";

export const useMonthlySpend = (months: number = 12) => {
  return useQuery({
    queryKey: ["analytics", "monthly-spend", months],
    queryFn: async (): Promise<MonthlySpendPoint[]> => {
      const response = await apiClient.axiosInstance.get<MonthlySpendPoint[]>(
        API_ENDPOINTS.ANALYTICS.MONTHLY_SPEND,
        { params: { months } }
      );
      return response.data;
    },
  });
};

export const useCategoryBreakdown = (months: number = 12) => {
  return useQuery({
    queryKey: ["analytics", "category-breakdown", months],
    queryFn: async (): Promise<CategorySpend[]> => {
      const response = await apiClient.axiosInstance.get<CategorySpend[]>(
        API_ENDPOINTS.ANALYTICS.CATEGORY_BREAKDOWN,
        { params: { months } }
      );
      return response.data;
    },
  });
};

export const useBudgetAlerts = () => {
  return useQuery({
    queryKey: ["analytics", "budget-alerts"],
    queryFn: async (): Promise<BudgetAlert[]> => {
      const response = await apiClient.axiosInstance.get<BudgetAlert[]>(
        API_ENDPOINTS.ANALYTICS.BUDGET_ALERTS
      );
      return response.data;
    },
  });
};

export const useCurrentMonthSpend = () => {
  return useQuery({
    queryKey: ["analytics", "current-month-spend"],
    queryFn: async (): Promise<number> => {
      const response = await apiClient.axiosInstance.get<{ total_spend: number }>(
        API_ENDPOINTS.ANALYTICS.CURRENT_MONTH_SPEND
      );
      return response.data.total_spend;
    },
  });
};

