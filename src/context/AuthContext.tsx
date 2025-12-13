import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
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
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('cms_token');
        if (storedToken) {
            verifyToken(storedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const verifyToken = async (tokenToVerify: string) => {
        try {
            const result = await authApi.verify(tokenToVerify);
            if (result.success && result.valid) {
                setToken(tokenToVerify);
                setUser(result.user);
            } else {
                localStorage.removeItem('cms_token');
            }
        } catch {
            localStorage.removeItem('cms_token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const result = await authApi.login(email, password);
            if (result.success && result.token) {
                setToken(result.token);
                setUser(result.user);
                localStorage.setItem('cms_token', result.token);
                return { success: true };
            }
            return { success: false, error: result.error || 'Login failed' };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('cms_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
