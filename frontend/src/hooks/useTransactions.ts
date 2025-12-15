/** Hooks for transaction management */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import { API_ENDPOINTS } from "../config/env";
import { Transaction, TransactionCreate } from "../types";

export const useTransactions = (params?: {
  start_date?: string;
  end_date?: string;
  category?: string;
  skip?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: async (): Promise<Transaction[]> => {
      const response = await apiClient.axiosInstance.get<Transaction[]>(
        API_ENDPOINTS.TRANSACTIONS.LIST,
        { params }
      );
      return response.data;
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionCreate): Promise<Transaction> => {
      const response = await apiClient.axiosInstance.post<Transaction>(
        API_ENDPOINTS.TRANSACTIONS.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.axiosInstance.delete(API_ENDPOINTS.TRANSACTIONS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

