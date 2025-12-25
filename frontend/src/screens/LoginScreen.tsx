/** Login screen */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLogin, useRegister } from "../hooks/useAuth";

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      if (isRegistering) {
        await registerMutation.mutateAsync({ email, password });
        Alert.alert("Success", "Account created! Please login.");
        setIsRegistering(false);
        setPassword("");
      } else {
        await loginMutation.mutateAsync({ email, password });
      }
    } catch (error: any) {
      console.error("Auth error details:", error);
      let errorMessage = "An error occurred. Please try again.";
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => `${err.loc.join(".")} - ${err.msg}`)
            .join("\n");
        } else {
          errorMessage = error.response.data.detail;
        }
      }

      // Friendly messages for common errors
      if (errorMessage.includes("Incorrect email or password")) {
        errorMessage = "Incorrect email or password. Please try again.";
      }

      setError(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>ReceiptLens</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? "Create Account" : "Sign In"}
          </Text>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[styles.button, (loginMutation.isPending || registerMutation.isPending) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              <Text style={styles.buttonText}>
                {loginMutation.isPending || registerMutation.isPending
                  ? "Loading..."
                  : isRegistering
                    ? "Register"
                    : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
            >
              <Text style={styles.switchText}>
                {isRegistering
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Register"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#2e7d32",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 16,
    alignItems: "center",
  },
  switchText: {
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ef5350'
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center'
  },
  buttonDisabled: {
    opacity: 0.7
  }
});

