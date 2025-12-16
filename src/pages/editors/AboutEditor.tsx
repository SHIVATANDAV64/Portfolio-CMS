import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { crudApi } from '../../lib/api';
import { EditorLayout, EditorPanel, PreviewPanel } from '../../components/EditorLayout';
import { AboutPreview } from '../../components/preview/AboutPreview';
import { useDebounce } from '../../hooks/useDebounce';

interface AboutData {
    $id?: string;
    title: string;
    description: string;
    image_url: string;
}

interface Skill {
    $id?: string;
    name: string;
    category: string;
}

const defaultAbout: AboutData = {
    title: 'The Dual Creator',
    description: 'My journey exists at the intersection of logic and emotion.',
    image_url: ''
};

export const AboutEditor = () => {
    const { user } = useAuth();

    const [originalData, setOriginalData] = useState<AboutData>(defaultAbout);
    const [formData, setFormData] = useState<AboutData>(defaultAbout);
    const [skills, setSkills] = useState<Skill[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const debouncedFormData = useDebounce(formData, 150);

    const hasChanges = useMemo(() => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    }, [formData, originalData]);

    // Separate skills by category for preview display
    const techSkills = useMemo(() =>
        skills.filter(s => s.category?.toLowerCase() === 'tech').map(s => s.name),
        [skills]
    );
    const artSkills = useMemo(() =>
        skills.filter(s => s.category?.toLowerCase() === 'art').map(s => s.name),
        [skills]
    );

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [aboutResult, skillsResult] = await Promise.all([
                crudApi.list('about', user!.id),
                crudApi.list('skills', user!.id)
            ]);

            
            

            if (aboutResult.success && aboutResult.documents?.length > 0) {
                setOriginalData(aboutResult.documents[0]);
                setFormData(aboutResult.documents[0]);
            }
            if (skillsResult.success) {
                setSkills(skillsResult.documents || []);
            }
        } catch (err) {
            console.error('Load data error:', err);
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        try {
            const dataToSave = {
                title: formData.title,
                description: formData.description,
                image_url: formData.image_url
            };

            
            let result;
            if (formData.$id) {
                result = await crudApi.update('about', formData.$id, dataToSave, user!.id);
            } else {
                result = await crudApi.create('about', dataToSave, user!.id);
            }

            
            if (result.success) {
                const newData = result.document || formData;
                setOriginalData(newData);
                setFormData(newData);
            } else {
                setError(result.error || 'Failed to save');
            }
        } catch (err) {
            console.error('Save error:', err);
            setError('Network error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setFormData(originalData);
        setError('');
    };

    const updateField = (field: keyof AboutData, value: string) => {
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
            title="About Section"
            icon="👤"
            description="Edit your about section content"
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
                            placeholder="The Dual Creator"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="field-label">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Your story..."
                            rows={5}
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="field-label">Portrait Image URL</label>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => updateField('image_url', e.target.value)}
                            placeholder="https://..."
                        />
                        {formData.image_url && (
                            <div className="mt-2 w-24 h-32 rounded-lg overflow-hidden" style={{ backgroundColor: '#E8E8E3' }}>
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>

                    {/* Skills Info Note */}
                    <div className="border-t pt-6" style={{ borderColor: 'rgba(26,26,26,0.05)' }}>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: '#F0F0EB' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-lg mb-1">Skills</h3>
                                    <p className="text-sm" style={{ color: 'rgba(26,26,26,0.5)' }}>
                                        Skills are displayed in the About preview but managed separately.
                                    </p>
                                </div>
                                <Link
                                    to="/dashboard/skills"
                                    className="btn btn-ghost"
                                    style={{ fontSize: '14px' }}
                                >
                                    Manage Skills →
                                </Link>
                            </div>
                            {/* Quick preview of current skills */}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {skills.slice(0, 6).map((skill) => (
                                    <span
                                        key={skill.$id}
                                        className="px-2 py-1 rounded-full text-xs"
                                        style={{ backgroundColor: 'white', color: '#1A1A1A' }}
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                                {skills.length > 6 && (
                                    <span className="px-2 py-1 text-xs" style={{ color: 'rgba(26,26,26,0.4)' }}>
                                        +{skills.length - 6} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </EditorPanel>

            {/* Right Panel: Live Preview */}
            <PreviewPanel>
                <AboutPreview
                    title={debouncedFormData.title}
                    description={debouncedFormData.description}
                    imageUrl={debouncedFormData.image_url}
                    techSkills={techSkills}
                    artSkills={artSkills}
                />
            </PreviewPanel>
        </EditorLayout>
    );
};
