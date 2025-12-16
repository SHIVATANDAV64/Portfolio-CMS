import { useState, useRef, useCallback } from 'react';
import { uploadImage, deleteImage, extractFileId } from '../lib/storage';

interface ImageUploadProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    aspect?: 'desktop' | 'mobile' | 'square' | 'video';
    placeholder?: string;
}

export const ImageUpload = ({
    label,
    value,
    onChange,
    aspect = 'desktop',
    placeholder = 'Drop image here or click to upload'
}: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Aspect ratios:
    // desktop: 16:10 (1920x1200, common laptop/monitor ratio)
    // video: 16:9 (YouTube, common video)
    // mobile: 9:16 (phone portrait)
    // square: 1:1
    const aspectClass = {
        desktop: 'aspect-[16/10]',
        video: 'aspect-video',
        mobile: 'aspect-[9/16]',
        square: 'aspect-square'
    }[aspect];

    const handleUpload = useCallback(async (file: File) => {
        setIsUploading(true);
        setError('');

        const result = await uploadImage(file);

        if (result.success && result.url) {
            onChange(result.url);
        } else {
            setError(result.error || 'Upload failed');
        }

        setIsUploading(false);
    }, [onChange]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDelete = async () => {
        if (!value) return;

        const fileId = extractFileId(value);
        if (fileId) {
            await deleteImage(fileId);
        }
        onChange('');
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setUrlInput('');
            setShowUrlInput(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="field-label">{label}</label>
                <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs text-charcoal/50 hover:text-charcoal transition-colors"
                >
                    {showUrlInput ? '← Back to upload' : 'Paste URL instead'}
                </button>
            </div>

            {showUrlInput ? (
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    />
                    <button
                        type="button"
                        onClick={handleUrlSubmit}
                        className="btn btn-primary !py-2 !px-4"
                    >
                        Set
                    </button>
                </div>
            ) : value ? (
                <div className="relative group">
                    <div className={`${aspectClass} w-full rounded-xl overflow-hidden bg-charcoal/5 flex items-center justify-center`}>
                        <img
                            src={value}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/2A2A2A/FAFAF5?text=Image+Error';
                            }}
                        />
                    </div>

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-white text-charcoal rounded-lg text-sm font-medium hover:bg-beige transition-colors"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        ${aspectClass} w-full rounded-xl border-2 border-dashed cursor-pointer
                        flex flex-col items-center justify-center gap-3 transition-all
                        ${isDragging
                            ? 'border-charcoal bg-charcoal/5'
                            : 'border-charcoal/20 hover:border-charcoal/40 bg-beige/50'
                        }
                        ${isUploading ? 'pointer-events-none opacity-60' : ''}
                    `}
                >
                    {isUploading ? (
                        <>
                            <div className="spinner !w-8 !h-8"></div>
                            <span className="text-sm text-charcoal/60">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-charcoal/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-sm text-charcoal/60">{placeholder}</span>
                            <span className="text-xs text-charcoal/40">Max 10MB • JPG, PNG, WebP, GIF, SVG</span>
                        </>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
            />

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};
