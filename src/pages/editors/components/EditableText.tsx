import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface EditableTextProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
    multiline?: boolean;
}

export const EditableText = ({
    value,
    onChange,
    placeholder = 'Click to edit...',
    className = '',
    as: Component = 'span',
    multiline = false
}: EditableTextProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (localValue !== value) {
            onChange(localValue);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === 'Escape') {
            setLocalValue(value);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        const InputComponent = multiline ? 'textarea' : 'input';
        return (
            <InputComponent
                ref={inputRef as any}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`${className} bg-white/80 border-2 border-[var(--olive)] rounded-lg px-3 py-2 outline-none`}
                style={{
                    font: 'inherit',
                    minWidth: '100px',
                    width: '100%'
                }}
                rows={multiline ? 4 : undefined}
            />
        );
    }

    return (
        <Component
            onClick={handleClick}
            className={`${className} cursor-text hover:bg-[var(--olive)]/5 rounded-lg px-1 -mx-1 transition-colors relative group`}
            title="Click to edit"
        >
            {value || <span className="text-[var(--muted)] italic">{placeholder}</span>}
            <span className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </span>
        </Component>
    );
};
