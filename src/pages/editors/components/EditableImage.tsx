import { useState } from 'react';

interface EditableImageProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
    maxHeight?: string;  // NEW: max height constraint
    className?: string;
}

export const EditableImage = ({
    value,
    onChange,
    label = 'Image',
    aspectRatio = 'auto',
    maxHeight = '400px',  // Sensible default
    className = ''
}: EditableImageProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [hasError, setHasError] = useState(false);

    const aspectClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        auto: ''
    };

    const handleSave = () => {
        onChange(localValue);
        setIsEditing(false);
        setHasError(false);
    };

    const handleCancel = () => {
        setLocalValue(value);
        setIsEditing(false);
        setHasError(false);
    };

    if (isEditing) {
        return (
            <div className={`${className} space-y-4`}>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                        {label} URL
                    </label>
                </div>
                <input
                    type="url"
                    value={localValue}
                    onChange={(e) => {
                        setLocalValue(e.target.value);
                        setHasError(false);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full"
                    autoFocus
                />
                {localValue && (
                    <div className={`relative ${aspectClasses[aspectRatio]} bg-[var(--beige)] rounded-lg overflow-hidden`}>
                        <img
                            src={localValue}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setHasError(true)}
                            onLoad={() => setHasError(false)}
                        />
                        {hasError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[var(--beige)] text-[var(--muted)] text-sm">
                                Failed to load image
                            </div>
                        )}
                    </div>
                )}
                <div className="flex gap-2">
                    <button onClick={handleSave} className="btn btn-primary py-2 px-4 text-sm">
                        Save
                    </button>
                    <button onClick={handleCancel} className="btn btn-ghost py-2 px-4 text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={`${className} relative ${aspectClasses[aspectRatio]} bg-[var(--beige)] rounded-xl overflow-hidden cursor-pointer group`}
            style={{ maxHeight }}
        >
            {value ? (
                <img
                    src={value}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ maxHeight, objectFit: 'cover' }}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--muted)]">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Click to add image</span>
                </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <svg className="w-5 h-5 text-[var(--charcoal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
