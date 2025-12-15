/** Main App component with navigation setup */
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import apiClient from "./src/api/client";

// Screens
import { LoginScreen } from "./src/screens/LoginScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { AddReceiptScreen } from "./src/screens/AddReceiptScreen";
import { TransactionsScreen } from "./src/screens/TransactionsScreen";
import { BudgetsScreen } from "./src/screens/BudgetsScreen";
import AuthProvider, { useAuthContext } from "./src/context/AuthContext";

const Stack = createStackNavigator();
const queryClient = new QueryClient();

// Main App
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuthContext();
  const queryClient = new QueryClient();

  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="AddReceipt" component={AddReceiptScreen} />
              <Stack.Screen
                name="Transactions"
                component={TransactionsScreen}
              />
              <Stack.Screen name="Budgets" component={BudgetsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

