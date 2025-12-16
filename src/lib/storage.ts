// Storage utilities for image upload to Appwrite Storage
import { storage } from './appwrite';
import { ID } from 'appwrite';

const BUCKET_ID = 'portfolio_images';

export interface UploadResult {
    success: boolean;
    fileId?: string;
    url?: string;
    error?: string;
}

/**
 * Upload an image file to Appwrite Storage
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

        // Upload file
        const result = await storage.createFile(BUCKET_ID, ID.unique(), file);

        // Get public URL
        const url = getImageUrl(result.$id);

        return {
            success: true,
            fileId: result.$id,
            url
        };
    } catch (err) {
        console.error('Upload error:', err);
        const error = err as { message?: string };
        return { success: false, error: error.message || 'Upload failed' };
    }
};

/**
 * Delete an image from Appwrite Storage
 */
export const deleteImage = async (fileId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        await storage.deleteFile(BUCKET_ID, fileId);
        return { success: true };
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
