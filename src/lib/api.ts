// Appwrite configuration for CMS Admin Panel

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface ApiResponse<T> {
    success?: boolean;
    error?: string;
    message?: string;
    documents?: T[];
    document?: T;
    total?: number;
}

// Auth API
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE}/admin-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', email, password })
        });
        return response.json();
    },

    verify: async (token: string) => {
        const response = await fetch(`${API_BASE}/admin-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', token })
        });
        return response.json();
    },

    refresh: async (token: string) => {
        const response = await fetch(`${API_BASE}/admin-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'refresh', token })
        });
        return response.json();
    }
};

// CRUD API
export const crudApi = {
    list: async (collection: string, token: string) => {
        const response = await fetch(`${API_BASE}/crud-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'list', collection })
        });
        return response.json();
    },

    get: async (collection: string, documentId: string, token: string) => {
        const response = await fetch(`${API_BASE}/crud-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'get', collection, documentId })
        });
        return response.json();
    },

    create: async (collection: string, data: Record<string, unknown>, token: string) => {
        const response = await fetch(`${API_BASE}/crud-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'create', collection, data })
        });
        return response.json();
    },

    update: async (collection: string, documentId: string, data: Record<string, unknown>, token: string) => {
        const response = await fetch(`${API_BASE}/crud-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'update', collection, documentId, data })
        });
        return response.json();
    },

    delete: async (collection: string, documentId: string, token: string) => {
        const response = await fetch(`${API_BASE}/crud-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'delete', collection, documentId })
        });
        return response.json();
    }
};

// Collection types
export type CollectionName =
    | 'about'
    | 'skills'
    | 'projects'
    | 'experience'
    | 'testimonials'
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
    { name: 'testimonials', label: 'Testimonials', icon: '💬' },
    { name: 'services', label: 'Services', icon: '⚡' },
    { name: 'social_links', label: 'Social Links', icon: '🔗' },
    { name: 'messages', label: 'Messages', icon: '📧' }
];
