import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface EditorLayoutProps {
    title: string;
    icon: string;
    description?: string;
    hasChanges: boolean;
    isSaving: boolean;
    onSave: () => void;
    onDiscard: () => void;
    children: ReactNode;
}

interface EditorPanelProps {
    children: ReactNode;
}

// Main Editor Layout with side-by-side panels
export const EditorLayout = ({
    title,
    icon,
    description,
    hasChanges,
    isSaving,
    onSave,
    onDiscard,
    children
}: EditorLayoutProps) => {
    const navigate = useNavigate();

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-charcoal/50 hover:text-charcoal text-sm mb-2 inline-flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="section-title">
                        <span>{icon}</span>
                        {title}
                    </h1>
                    {description && <p className="section-subtitle">{description}</p>}
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <span className="text-sm text-terracotta flex items-center gap-2">
                            <span className="unsaved-dot"></span>
                            Unsaved changes
                        </span>
                    )}
                    {hasChanges && (
                        <button onClick={onDiscard} className="btn btn-ghost">
                            Discard
                        </button>
                    )}
                    <button
                        onClick={onSave}
                        disabled={isSaving || !hasChanges}
                        className="btn btn-primary"
                    >
                        {isSaving ? (
                            <>
                                <span className="spinner !w-4 !h-4 !border-white/30 !border-t-white"></span>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>

            {/* Content: Side by Side */}
            <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                {children}
            </div>
        </div>
    );
};

// Left Panel: Form Fields
export const EditorPanel = ({ children }: EditorPanelProps) => {
    return (
        <div className="editor-panel">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-charcoal/5">
                <svg className="w-5 h-5 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-medium text-charcoal/60 uppercase tracking-wider">Editor</span>
            </div>
            {children}
        </div>
    );
};

// Right Panel: Live Preview
export const PreviewPanel = ({ children }: EditorPanelProps) => {
    return (
        <div className="preview-panel flex flex-col">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-charcoal/5 bg-white/50">
                <svg className="w-5 h-5 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm font-medium text-charcoal/60 uppercase tracking-wider">Preview</span>
            </div>
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
};
