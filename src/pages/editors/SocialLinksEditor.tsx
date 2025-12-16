import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crudApi } from '../../lib/api';
import { EditorLayout, EditorPanel, PreviewPanel } from '../../components/EditorLayout';
import { SocialLinksPreview } from '../../components/preview/SocialLinksPreview';

interface SocialLink {
    $id?: string;
    platform: string;
    url: string;
    icon: string;
}

export const SocialLinksEditor = () => {
    const { user } = useAuth();

    const [links, setLinks] = useState<SocialLink[]>([]);
    const [originalLinks, setOriginalLinks] = useState<SocialLink[]>([]);
    const [newPlatform, setNewPlatform] = useState('');
    const [newUrl, setNewUrl] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const hasChanges = useMemo(() => {
        return JSON.stringify(links) !== JSON.stringify(originalLinks);
    }, [links, originalLinks]);

    // Transform for preview
    const previewLinks = useMemo(() =>
        links.map(l => ({
            id: l.$id,
            platform: l.platform,
            url: l.url
        })),
        [links]
    );

    // Common platforms for quick add
    const popularPlatforms = ['GitHub', 'LinkedIn', 'Twitter', 'Instagram', 'Dribbble', 'Behance'];

    useEffect(() => {
        loadLinks();
    }, []);

    const loadLinks = async () => {
        setIsLoading(true);
        try {
            const result = await crudApi.list('social_links', user!.id);
            
            if (result.success) {
                setLinks(result.documents || []);
                setOriginalLinks(result.documents || []);
            } else {
                setError(result.error || 'Failed to load social links');
            }
        } catch (err) {
            console.error('Load social links error:', err);
            setError('Failed to load social links');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLink = async () => {
        if (!newPlatform.trim() || !newUrl.trim()) return;
        setIsAdding(true);
        setError('');
        try {
            
            const result = await crudApi.create('social_links', {
                platform: newPlatform,
                url: newUrl,
                icon: ''
            }, user!.id);
            
            if (result.success && result.document) {
                const updated = [...links, result.document];
                setLinks(updated);
                setOriginalLinks(updated);
                setNewPlatform('');
                setNewUrl('');
            } else {
                setError(result.error || 'Failed to add link');
            }
        } catch (err) {
            console.error('Add social link error:', err);
            setError('Failed to add link');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteLink = async (linkId: string) => {
        try {
            const result = await crudApi.delete('social_links', linkId, user!.id);
            if (result.success) {
                const updated = links.filter(l => l.$id !== linkId);
                setLinks(updated);
                setOriginalLinks(updated);
            }
        } catch {
            setError('Failed to delete');
        }
    };

    const handleSave = async () => {
        // All changes are saved individually, just sync state
        setOriginalLinks([...links]);
    };

    const handleDiscard = () => {
        setLinks([...originalLinks]);
        setError('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <EditorLayout
            title="Social Links"
            icon="🔗"
            description="Manage your social media presence"
            hasChanges={hasChanges}
            isSaving={false}
            onSave={handleSave}
            onDiscard={handleDiscard}
        >
            {/* Left Panel: Form Fields */}
            <EditorPanel>
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Quick Add */}
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F0F0EB' }}>
                        <h3 className="font-serif text-lg mb-3">Add Social Link</h3>

                        {/* Quick platform buttons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {popularPlatforms.map((platform) => (
                                <button
                                    key={platform}
                                    onClick={() => setNewPlatform(platform)}
                                    type="button"
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        borderRadius: '9999px',
                                        border: `1px solid ${newPlatform === platform ? '#3A4D39' : 'rgba(26,26,26,0.2)'}`,
                                        backgroundColor: newPlatform === platform ? '#3A4D39' : 'transparent',
                                        color: newPlatform === platform ? 'white' : '#1A1A1A',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {platform}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPlatform}
                                onChange={(e) => setNewPlatform(e.target.value)}
                                placeholder="Platform name"
                                style={{ width: '120px' }}
                            />
                            <input
                                type="url"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="https://..."
                                style={{ flex: 1 }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                            />
                            <button
                                onClick={handleAddLink}
                                disabled={isAdding || !newPlatform.trim() || !newUrl.trim()}
                                className="btn btn-primary"
                                style={{ minWidth: '80px' }}
                            >
                                {isAdding ? '...' : 'Add'}
                            </button>
                        </div>
                    </div>

                    {/* Existing Links */}
                    <div className="space-y-3">
                        <h3 className="field-label">Your Links ({links.length})</h3>
                        {links.length === 0 ? (
                            <p className="text-sm text-charcoal/40 italic py-4">No social links added yet</p>
                        ) : (
                            links.map((link) => (
                                <div key={link.$id} className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#F0F0EB' }}>
                                    <span className="font-medium text-sm" style={{ width: '100px' }}>{link.platform}</span>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-sm text-olive truncate hover:underline"
                                    >
                                        {link.url}
                                    </a>
                                    <button
                                        onClick={() => link.$id && handleDeleteLink(link.$id)}
                                        style={{ padding: '8px', color: 'rgba(26,26,26,0.3)' }}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </EditorPanel>

            {/* Right Panel: Live Preview */}
            <PreviewPanel>
                <SocialLinksPreview links={previewLinks} />
            </PreviewPanel>
        </EditorLayout>
    );
};
