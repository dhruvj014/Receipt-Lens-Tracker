/** Transaction list component */
import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Transaction } from "../types";
import Logger from "../utils/logger";

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps & { scrollEnabled?: boolean }> = ({
  transactions,
  onTransactionPress,
  onDelete,
  scrollEnabled = true,
}) => {
  React.useEffect(() => {
    if (transactions?.length > 0) {
      Logger.debug("Rendering TransactionList", { count: transactions.length });
    }
  }, [transactions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => onTransactionPress?.(item)}
    >
      <View style={styles.transactionContent}>
        <View style={styles.transactionMain}>
          <Text style={styles.category}>{item.category}</Text>
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
          <Text style={styles.date}>{formatDate(item.transaction_date)}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
          {item.receipt_id && (
            <Text style={styles.receiptBadge}>📄 Receipt</Text>
          )}
        </View>
      </View>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (!scrollEnabled) {
    if (!transactions || transactions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      );
    }
    return (
      <View style={styles.list}>
        {transactions.map((item) => (
          <View key={item.id} style={{ marginBottom: 12 }}>
            {renderItem({ item })}
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  transactionItem: {
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
  transactionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  transactionMain: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 4,
  },
  receiptBadge: {
    fontSize: 10,
    color: "#666",
  },
  deleteButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffebee",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  deleteText: {
    color: "#c62828",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

