
import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/client";

interface AuthContextType {
    isAuthenticated: boolean | null;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await apiClient.getToken();
            setIsAuthenticated(!!token);
        };
        checkAuth();
    }, []);

    const signIn = async (token: string) => {
        await apiClient.setToken(token);
        setIsAuthenticated(true);
    };

    const signOut = async () => {
        await apiClient.clearToken();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
};
