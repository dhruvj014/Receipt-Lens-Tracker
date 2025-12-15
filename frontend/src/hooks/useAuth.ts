/** Authentication hooks */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import apiClient, { apiClient as client } from "../api/client";
import { API_ENDPOINTS } from "../config/env";
import { UserCreate, UserLogin, TokenResponse, User } from "../types";

import { useAuthContext } from "../context/AuthContext";

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { signIn } = useAuthContext();

  return useMutation({
    mutationFn: async (data: UserCreate): Promise<User> => {
      const response = await client.axiosInstance.post<User>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );
      // Auto-login after registration (if backend returns token, but here it returns User)
      // Since backend returns User, we might need a separate login call, 
      // OR just navigate to Login. 
      // The user said "account created but getting this", implying they were implementing auto-login or simply navigating.
      // Let's stick to the previous behavior: Alert success & maybe navigate to Login?
      // Actually previous behavior was just Alert. 
      // But let's check the previous code...
      return response.data;
    },
    onSuccess: () => {
      // API returns User object, not token. So we can't signIn() yet.
      // We should let the component handle the next step (Alert or Navigation).
      // If we want to navigate to Login, we can use navigation.navigate("Login")
      // But the error was about RESET to Dashboard.
      // Let's keep it simple: do nothing here, let the UI handle success.
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { signIn } = useAuthContext();

  return useMutation({
    mutationFn: async (data: UserLogin): Promise<TokenResponse> => {
      const formData = new URLSearchParams();
      formData.append("username", data.email);
      formData.append("password", data.password);

      const response = await client.axiosInstance.post<TokenResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      // Update global auth state, which triggers App.tsx to switch to Dashboard stack
      await signIn(data.access_token);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { signOut } = useAuthContext();

  return {
    logout: async () => {
      await signOut();
      queryClient.clear();
      // App.tsx will auto-switch to Login stack
    },
  };
};

