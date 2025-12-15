/** Transactions screen for viewing and managing transactions */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useTransactions } from "../hooks/useTransactions";
import { useDeleteTransaction } from "../hooks/useTransactions";
import { TransactionList } from "../components/TransactionList";
import { Transaction } from "../types";

export const TransactionsScreen: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const { data: transactions, isLoading } = useTransactions({
    category: categoryFilter || undefined,
    limit: 100,
  });
  const deleteMutation = useDeleteTransaction();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const categories = Array.from(
    new Set(transactions?.map((t) => t.category) || [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by category..."
          value={categoryFilter}
          onChangeText={setCategoryFilter}
        />
        {categoryFilter && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setCategoryFilter("")}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <TransactionList
          transactions={transactions || []}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  filters: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#999",
  },
});

