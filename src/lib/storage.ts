// Storage utilities for image upload via Appwrite Function (JWT authenticated)
import { functions } from './appwrite';
import { ExecutionMethod } from 'appwrite';
import { authApi } from './api';

const FUNCTION_ID = import.meta.env.VITE_FUNCTION_CRUD_CONTENT;
const BUCKET_ID = 'portfolio_images';

export interface UploadResult {
    success: boolean;
    fileId?: string;
    url?: string;
    error?: string;
}

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data:mime;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
    });
};

/**
 * Upload an image file via Appwrite Function (JWT authenticated)
 */
export const uploadImage = async (file: File): Promise<UploadResult> => {
    try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF, SVG' };
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return { success: false, error: 'File too large. Maximum size: 10MB' };
        }

        // Get JWT access token
        const accessToken = await authApi.getAccessToken();
        if (!accessToken) {
            return { success: false, error: 'Not authenticated' };
        }

        // Convert file to base64
        const fileData = await fileToBase64(file);

        // Call function to upload
        const execution = await functions.createExecution(
            FUNCTION_ID,
            JSON.stringify({
                action: 'upload',
                collection: 'projects', // Required by function but not used for uploads
                accessToken,
                fileData,
                fileName: file.name,
                mimeType: file.type
            }),
            false,
            '/',
            ExecutionMethod.POST
        );

        const result = JSON.parse(execution.responseBody);

        if (result.success) {
            return {
                success: true,
                fileId: result.fileId,
                url: result.url
            };
        }

        return { success: false, error: result.error || 'Upload failed' };
    } catch (err) {
        console.error('Upload error:', err);
        const error = err as { message?: string };
        return { success: false, error: error.message || 'Upload failed' };
    }
};

/**
 * Delete an image via Appwrite Function (JWT authenticated)
 */
export const deleteImage = async (fileId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        // Get JWT access token
        const accessToken = await authApi.getAccessToken();
        if (!accessToken) {
            return { success: false, error: 'Not authenticated' };
        }

        const execution = await functions.createExecution(
            FUNCTION_ID,
            JSON.stringify({
                action: 'deleteFile',
                collection: 'projects', // Required by function but not used for deletes
                accessToken,
                fileId
            }),
            false,
            '/',
            ExecutionMethod.POST
        );

        const result = JSON.parse(execution.responseBody);
        return result.success ? { success: true } : { success: false, error: result.error };
    } catch (err) {
        console.error('Delete error:', err);
        const error = err as { message?: string };
        return { success: false, error: error.message || 'Delete failed' };
    }
};

/**
 * Get public URL for an image
 */
export const getImageUrl = (fileId: string): string => {
    const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
    const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
    return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
};

/**
 * Extract file ID from Appwrite Storage URL
 */
export const extractFileId = (url: string): string | null => {
    const match = url.match(/\/files\/([a-zA-Z0-9]+)\/view/);
    return match ? match[1] : null;
};

