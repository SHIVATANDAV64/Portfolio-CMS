import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type AuthUser } from '../lib/api';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = async () => {
        try {
            const result = await authApi.getCurrentUser();
            if (result.success && result.user) {
                setUser(result.user);
            }
        } catch {
            // No existing session
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const result = await authApi.login(email, password);
            if (result.success && result.user) {
                setUser(result.user);
                return { success: true };
            }
            return { success: false, error: result.error || 'Login failed' };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
