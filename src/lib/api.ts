// Appwrite CMS API using Functions SDK with JWT Authentication

import { functions } from './appwrite';
import { ExecutionMethod } from 'appwrite';

// Function IDs from Appwrite Console
const FUNCTION_IDS = {
    CRUD_CONTENT: import.meta.env.VITE_FUNCTION_CRUD_CONTENT,
    ADMIN_AUTH: import.meta.env.VITE_FUNCTION_ADMIN_AUTH,
};

export interface ApiResponse<T> {
    success?: boolean;
    error?: string;
    message?: string;
    documents?: T[];
    document?: T;
    total?: number;
}

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

// ========================================
// JWT Token Management
// ========================================
class TokenManager {
    private accessToken: string | null = null;
    private refreshPromise: Promise<boolean> | null = null;

    getAccessToken(): string | null {
        return this.accessToken;
    }

    setAccessToken(token: string | null): void {
        this.accessToken = token;
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    setRefreshToken(token: string | null): void {
        if (token) {
            localStorage.setItem('refreshToken', token);
        } else {
            localStorage.removeItem('refreshToken');
        }
    }

    getStoredUser(): AuthUser | null {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    }

    setStoredUser(user: AuthUser | null): void {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }

    clearAll(): void {
        this.accessToken = null;
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    // Check if access token is likely expired (decode without verify)
    isAccessTokenExpired(): boolean {
        if (!this.accessToken) return true;
        try {
            const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
            // Add 10 second buffer
            return payload.exp * 1000 < Date.now() + 10000;
        } catch {
            return true;
        }
    }

    // Ensure we have a valid access token, refresh if needed
    async ensureValidToken(): Promise<string | null> {
        if (!this.isAccessTokenExpired()) {
            return this.accessToken;
        }

        // Use single promise to prevent multiple simultaneous refreshes
        if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
        }

        const success = await this.refreshPromise;
        this.refreshPromise = null;

        return success ? this.accessToken : null;
    }

    private async refreshAccessToken(): Promise<boolean> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;

        try {
            const execution = await functions.createExecution(
                FUNCTION_IDS.ADMIN_AUTH,
                JSON.stringify({ action: 'refresh', refreshToken }),
                false,
                '/',
                ExecutionMethod.POST
            );
            const data = JSON.parse(execution.responseBody);

            if (data.success && data.accessToken) {
                this.accessToken = data.accessToken;
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }
}

export const tokenManager = new TokenManager();

// ========================================
// Auth API - JWT Based (Hybrid: client validates, server issues JWT)
// ========================================
export const authApi = {
    login: async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
        try {
            // Step 1: Create session client-side (this validates the password)
            // Import account dynamically to avoid circular dependency
            const { account } = await import('./appwrite');

            // Try to create a session - this will fail if password is wrong
            await account.createEmailPasswordSession(email, password);

            // Step 2: Get the current user to verify session worked
            const appwriteUser = await account.get();

            // Step 3: Call function to verify admin status and get JWT
            const execution = await functions.createExecution(
                FUNCTION_IDS.ADMIN_AUTH,
                JSON.stringify({ action: 'getTokens', email, userId: appwriteUser.$id }),
                false,
                '/',
                ExecutionMethod.POST
            );
            const data = JSON.parse(execution.responseBody);

            if (data.success) {
                tokenManager.setAccessToken(data.accessToken);
                tokenManager.setRefreshToken(data.refreshToken);
                tokenManager.setStoredUser(data.user);

                // Delete the Appwrite session - we'll use JWT from now on
                await account.deleteSessions();

                return { success: true, user: data.user };
            }

            // Not an admin, delete the session
            await account.deleteSessions();
            return { success: false, error: data.error || 'Not authorized as admin' };
        } catch (err: unknown) {
            const error = err as { message?: string; code?: number; type?: string };
            // Check for invalid credentials error
            if (error.type === 'user_invalid_credentials') {
                return { success: false, error: 'Invalid email or password' };
            }
            return { success: false, error: error.message || 'Login failed' };
        }
    },

    logout: (): void => {
        tokenManager.clearAll();
    },

    getCurrentUser: async (): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
        // First check if we have stored credentials
        const storedUser = tokenManager.getStoredUser();
        const refreshToken = tokenManager.getRefreshToken();

        if (!storedUser || !refreshToken) {
            return { success: false, error: 'Not logged in' };
        }

        // Try to get a valid access token
        const accessToken = await tokenManager.ensureValidToken();
        if (!accessToken) {
            tokenManager.clearAll();
            return { success: false, error: 'Session expired' };
        }

        // Verify the token is still valid on the server
        try {
            const execution = await functions.createExecution(
                FUNCTION_IDS.ADMIN_AUTH,
                JSON.stringify({ action: 'verify', accessToken }),
                false,
                '/',
                ExecutionMethod.POST
            );
            const data = JSON.parse(execution.responseBody);

            if (data.success) {
                tokenManager.setStoredUser(data.user);
                return { success: true, user: data.user };
            }
            tokenManager.clearAll();
            return { success: false, error: data.error };
        } catch {
            return { success: false, error: 'Verification failed' };
        }
    },

    // Get access token for API calls
    getAccessToken: () => tokenManager.ensureValidToken()
};

// CRUD API - Now includes JWT access token
export const crudApi = {
    list: async (collection: string, _userId?: string) => {
        const accessToken = await authApi.getAccessToken();
        if (!accessToken) {
            return { success: false, error: 'Not authenticated' };
        }

        const execution = await functions.createExecution(
            FUNCTION_IDS.CRUD_CONTENT,
            JSON.stringify({ action: 'list', collection, accessToken }),
            false,
            '/',
            ExecutionMethod.POST
        );

        // Handle empty responses
        if (!execution.responseBody) {
            console.error('Empty response from function', execution);
            return { success: false, error: 'Empty response from server' };
        }

        return JSON.parse(execution.responseBody);
    },

    get: async (collection: string, documentId: string, _userId?: string) => {
        const accessToken = await authApi.getAccessToken();
        if (!accessToken) {
            return { success: false, error: 'Not authenticated' };
        }

        const execution = await functions.createExecution(
            FUNCTION_IDS.CRUD_CONTENT,
            JSON.stringify({ action: 'get', collection, documentId, accessToken }),
            false,
            '/',
            ExecutionMethod.POST
        );
        return JSON.parse(execution.responseBody);
    },

    create: async (collection: string, data: Record<string, unknown>, _userId?: string) => {
        const accessToken = await authApi.getAccessToken();
        if (!accessToken) {
            return { success: false, error: 'Not authenticated' };
        }

        const execution = await functions.createExecution(
            FUNCTION_IDS.CRUD_CONTENT,
            JSON.stringify({ action: 'create', collection, data, accessToken }),
            false,
            '/',
            ExecutionMethod.POST
        );
        return JSON.parse(execution.responseBody);
    },

    update: async (collection: string, documentId: string, data: Record<string, unknown>, _userId?: string) => {
        const accessToken = await authApi.getAccessToken();
        if (!accessToken) {
            return { success: false, error: 'Not authenticated' };
        }

        const execution = await functions.createExecution(
            FUNCTION_IDS.CRUD_CONTENT,
            JSON.stringify({ action: 'update', collection, documentId, data, accessToken }),
            false,
            '/',
            ExecutionMethod.POST
        );
        return JSON.parse(execution.responseBody);
    },

    delete: async (collection: string, documentId: string, _userId?: string) => {
        const accessToken = await authApi.getAccessToken();
        if (!accessToken) {
            return { success: false, error: 'Not authenticated' };
        }

        const execution = await functions.createExecution(
            FUNCTION_IDS.CRUD_CONTENT,
            JSON.stringify({ action: 'delete', collection, documentId, accessToken }),
            false,
            '/',
            ExecutionMethod.POST
        );
        return JSON.parse(execution.responseBody);
    }
};

// Collection types
export type CollectionName =
    | 'about'
    | 'skills'
    | 'projects'
    | 'experience'
    | 'services'
    | 'social_links'
    | 'hero'
    | 'messages';

export const COLLECTIONS: { name: CollectionName; label: string; icon: string }[] = [
    { name: 'hero', label: 'Hero Section', icon: '🏠' },
    { name: 'about', label: 'About', icon: '👤' },
    { name: 'skills', label: 'Skills', icon: '🛠️' },
    { name: 'projects', label: 'Projects', icon: '📁' },
    { name: 'experience', label: 'Experience', icon: '💼' },
    { name: 'services', label: 'Services', icon: '⚡' },
    { name: 'social_links', label: 'Social Links', icon: '🔗' },
    { name: 'messages', label: 'Messages', icon: '📧' }
];
