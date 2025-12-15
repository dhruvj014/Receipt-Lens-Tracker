/** Budgets screen for managing spending budgets */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import { API_ENDPOINTS } from "../config/env";
import { Budget, BudgetCreate } from "../types";
import { useBudgetAlerts } from "../hooks/useAnalytics";

export const BudgetsScreen: React.FC = () => {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const queryClient = useQueryClient();

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async (): Promise<Budget[]> => {
      const response = await apiClient.axiosInstance.get<Budget[]>(
        API_ENDPOINTS.BUDGETS.LIST
      );
      return response.data;
    },
  });

  const { data: alerts } = useBudgetAlerts();

  const createBudgetMutation = useMutation({
    mutationFn: async (data: BudgetCreate): Promise<Budget> => {
      const response = await apiClient.axiosInstance.post<Budget>(
        API_ENDPOINTS.BUDGETS.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setCategory("");
      setLimit("");
      Alert.alert("Success", "Budget created/updated successfully");
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.axiosInstance.delete(API_ENDPOINTS.BUDGETS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const handleCreateBudget = () => {
    if (!category || !limit) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const limitNum = parseFloat(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      Alert.alert("Error", "Limit must be a positive number");
      return;
    }

    createBudgetMutation.mutate({
      category,
      monthly_limit: limitNum,
    });
  };

  const handleDeleteBudget = (id: string) => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBudgetMutation.mutate(id),
        },
      ]
    );
  };

  const getBudgetStatus = (budget: Budget) => {
    const alert = alerts?.find((a) => a.category === budget.category);
    if (!alert) return { color: "#4caf50", status: "Under Budget" };
    if (alert.over_by > 0) {
      return { color: "#f44336", status: "Over Budget" };
    }
    if (alert.percentage >= 80) {
      return { color: "#ff9800", status: "Near Limit" };
    }
    return { color: "#4caf50", status: "On Track" };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Manage Budgets</Text>

        <View style={styles.form}>
          <Text style={styles.formLabel}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., groceries, restaurant"
            value={category}
            onChangeText={setCategory}
          />

          <Text style={styles.formLabel}>Monthly Limit ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={limit}
            onChangeText={setLimit}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateBudget}
            disabled={createBudgetMutation.isPending}
          >
            <Text style={styles.createButtonText}>
              {createBudgetMutation.isPending
                ? "Creating..."
                : "Create/Update Budget"}
            </Text>
          </TouchableOpacity>
        </View>

        {alerts && alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Budget Alerts</Text>
            {alerts.map((alert) => (
              <View key={alert.category} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertCategory}>{alert.category}</Text>
                  <Text
                    style={[
                      styles.alertStatus,
                      {
                        color:
                          alert.over_by > 0
                            ? "#f44336"
                            : alert.percentage >= 80
                            ? "#ff9800"
                            : "#4caf50",
                      },
                    ]}
                  >
                    {alert.percentage.toFixed(1)}%
                  </Text>
                </View>
                <Text style={styles.alertDetails}>
                  ${alert.spent.toFixed(2)} / ${alert.limit.toFixed(2)}
                </Text>
                {alert.over_by > 0 && (
                  <Text style={styles.overBudgetText}>
                    Over by ${alert.over_by.toFixed(2)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.budgetsSection}>
          <Text style={styles.sectionTitle}>Your Budgets</Text>
          {isLoading ? (
            <Text style={styles.emptyText}>Loading budgets...</Text>
          ) : budgets && budgets.length > 0 ? (
            budgets.map((budget) => {
              const status = getBudgetStatus(budget);
              return (
                <View key={budget.id} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View>
                      <Text style={styles.budgetCategory}>
                        {budget.category}
                      </Text>
                      <Text style={styles.budgetLimit}>
                        ${budget.monthly_limit.toFixed(2)} / month
                      </Text>
                    </View>
                    <View style={styles.budgetStatus}>
                      <View
                        style={[
                          styles.statusIndicator,
                          { backgroundColor: status.color },
                        ]}
                      />
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.status}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteBudget(budget.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No budgets set yet</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 24,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  createButton: {
    backgroundColor: "#2e7d32",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  alertsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alertCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  alertStatus: {
    fontSize: 16,
    fontWeight: "700",
  },
  alertDetails: {
    fontSize: 14,
    color: "#666",
  },
  overBudgetText: {
    fontSize: 12,
    color: "#f44336",
    marginTop: 4,
    fontWeight: "600",
  },
  budgetsSection: {
    marginBottom: 24,
  },
  budgetCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetCategory: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  budgetLimit: {
    fontSize: 14,
    color: "#666",
  },
  budgetStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffebee",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    color: "#c62828",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    padding: 32,
  },
});

