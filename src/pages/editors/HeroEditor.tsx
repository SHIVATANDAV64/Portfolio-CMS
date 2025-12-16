import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crudApi } from '../../lib/api';
import { EditorLayout, EditorPanel, PreviewPanel } from '../../components/EditorLayout';
import { HeroPreview } from '../../components/preview/HeroPreview';
import { useDebounce } from '../../hooks/useDebounce';

interface HeroData {
    $id?: string;
    title: string;
    subtitle: string;
    description: string;
    cta_text: string;
    cta_link: string;
}

const defaultHero: HeroData = {
    title: 'Digital Artisan',
    subtitle: 'Based in India',
    description: 'Crafting digital experiences that blend technical precision with artistic soul.',
    cta_text: 'View Projects',
    cta_link: '#work'
};

export const HeroEditor = () => {
    const { user } = useAuth();

    // Original data from server
    const [originalData, setOriginalData] = useState<HeroData>(defaultHero);
    // Local edits (not saved until Save clicked)
    const [formData, setFormData] = useState<HeroData>(defaultHero);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Debounced form data for preview (prevents laggy preview)
    const debouncedFormData = useDebounce(formData, 150);

    // Check if there are unsaved changes
    const hasChanges = useMemo(() => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    }, [formData, originalData]);

    useEffect(() => {
        loadHero();
    }, []);

    const loadHero = async () => {
        setIsLoading(true);
        try {
            const result = await crudApi.list('hero', user!.id);
            if (result.success && result.documents?.length > 0) {
                const data = result.documents[0];
                setOriginalData(data);
                setFormData(data);
            }
        } catch (err) {
            setError('Failed to load hero data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        try {
            const dataToSave = {
                title: formData.title || '',
                subtitle: formData.subtitle || '',
                description: formData.description || '',
                cta_text: formData.cta_text || '',
                cta_link: formData.cta_link || ''
            };

            

            let result;
            if (formData.$id) {
                result = await crudApi.update('hero', formData.$id, dataToSave, user!.id);
            } else {
                result = await crudApi.create('hero', dataToSave, user!.id);
            }

            

            if (result.success) {
                const newData = result.document || formData;
                setOriginalData(newData);
                setFormData(newData);
            } else {
                // Show detailed error from backend
                const errorMsg = result.message || result.error || 'Failed to save';
                console.error('HeroEditor: Save failed', errorMsg);
                setError(errorMsg);
            }
        } catch (err) {
            console.error('HeroEditor: Network error', err);
            const errorMsg = err instanceof Error ? err.message : 'Network error - check console';
            setError(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setFormData(originalData);
        setError('');
    };

    const updateField = (field: keyof HeroData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            title="Hero Section"
            icon="🏠"
            description="Edit your landing page hero content"
            hasChanges={hasChanges}
            isSaving={isSaving}
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
                    {/* Title */}
                    <div>
                        <label className="field-label">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            placeholder="Digital Artisan"
                        />
                        <p className="text-xs text-charcoal/40 mt-1">
                            Words will stack on separate lines. Use spaces to separate.
                        </p>
                    </div>

                    {/* Subtitle / Location */}
                    <div>
                        <label className="field-label">Subtitle / Location</label>
                        <input
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => updateField('subtitle', e.target.value)}
                            placeholder="Based in India"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="field-label">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Your hero description..."
                            rows={4}
                        />
                    </div>

                    {/* CTA Button */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="field-label">Button Text</label>
                            <input
                                type="text"
                                value={formData.cta_text}
                                onChange={(e) => updateField('cta_text', e.target.value)}
                                placeholder="View Projects"
                            />
                        </div>
                        <div>
                            <label className="field-label">Button Link</label>
                            <input
                                type="text"
                                value={formData.cta_link}
                                onChange={(e) => updateField('cta_link', e.target.value)}
                                placeholder="#work"
                            />
                        </div>
                    </div>
                </div>
            </EditorPanel>

            {/* Right Panel: Live Preview */}
            <PreviewPanel>
                <HeroPreview
                    title={debouncedFormData.title}
                    subtitle={debouncedFormData.subtitle}
                    description={debouncedFormData.description}
                    ctaText={debouncedFormData.cta_text}
                />
            </PreviewPanel>
        </EditorLayout>
    );
};
