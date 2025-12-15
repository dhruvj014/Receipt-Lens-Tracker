/** Dashboard screen showing overview and recent transactions */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCurrentMonthSpend, useMonthlySpend } from "../hooks/useAnalytics";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionList } from "../components/TransactionList";
import { SpendChart } from "../components/SpendChart";
import { useLogout } from "../hooks/useAuth";

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useLogout();
  const { data: currentSpend, refetch: refetchSpend } = useCurrentMonthSpend();
  const { data: monthlySpend, refetch: refetchMonthly } = useMonthlySpend(6);
  const {
    data: transactions,
    refetch: refetchTransactions,
    isRefetching,
  } = useTransactions({ limit: 10 });

  const handleRefresh = () => {
    refetchSpend();
    refetchMonthly();
    refetchTransactions();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>This Month</Text>
        <Text style={styles.summaryAmount}>
          ${currentSpend?.toFixed(2) || "0.00"}
        </Text>
      </View>

      {monthlySpend && monthlySpend.length > 0 && (
        <SpendChart data={monthlySpend} months={6} />
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("AddReceipt" as never)}
        >
          <Text style={styles.actionButtonText}>📷 Add Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Transactions" as never)}
        >
          <Text style={styles.actionButtonText}>📋 View Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Budgets" as never)}
        >
          <Text style={styles.actionButtonText}>💰 Manage Budgets</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions && transactions.length > 0 ? (
          <TransactionList
            transactions={transactions}
            scrollEnabled={false}
            onTransactionPress={(transaction) => {
              // Navigate to transaction details if needed
              console.log("Transaction pressed:", transaction.id);
            }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  logoutText: {
    fontSize: 14,
    color: "#c62828",
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#2e7d32",
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  recentSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
});

