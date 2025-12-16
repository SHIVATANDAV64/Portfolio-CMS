import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crudApi } from '../../lib/api';
import { EditorLayout, EditorPanel, PreviewPanel } from '../../components/EditorLayout';
import { ExperiencePreview } from '../../components/preview/ExperiencePreview';

interface Experience {
    $id?: string;
    role: string;
    company: string;
    start_date: string;
    end_date: string;
    description: string;
}

const emptyExperience: Omit<Experience, '$id'> = {
    role: 'New Role',
    company: 'Company Name',
    start_date: new Date().getFullYear().toString(),
    end_date: 'Present',
    description: ''
};

export const ExperienceEditor = () => {
    const { user } = useAuth();

    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [originalExperiences, setOriginalExperiences] = useState<Experience[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const selectedExperience = useMemo(() =>
        experiences.find(e => e.$id === selectedId) || null,
        [experiences, selectedId]
    );

    const hasChanges = useMemo(() => {
        return JSON.stringify(experiences) !== JSON.stringify(originalExperiences);
    }, [experiences, originalExperiences]);

    // Transform for preview
    const previewExperiences = useMemo(() =>
        experiences.map(e => ({
            id: e.$id,
            role: e.role,
            company: e.company,
            startDate: e.start_date,
            endDate: e.end_date,
            description: e.description
        })),
        [experiences]
    );

    useEffect(() => {
        loadExperiences();
    }, []);

    const loadExperiences = async () => {
        setIsLoading(true);
        try {
            const result = await crudApi.list('experience', user!.id);
            
            if (result.success) {
                setExperiences(result.documents || []);
                setOriginalExperiences(result.documents || []);
            } else {
                setError(result.error || 'Failed to load experiences');
            }
        } catch (err) {
            console.error('Load experiences error:', err);
            setError('Failed to load experiences');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddExperience = async () => {
        setIsAdding(true);
        setError('');
        try {
            
            const result = await crudApi.create('experience', emptyExperience, user!.id);
            
            if (result.success && result.document) {
                const updated = [...experiences, result.document];
                setExperiences(updated);
                setOriginalExperiences(updated);
                setSelectedId(result.document.$id);
            } else {
                setError(result.error || 'Failed to create experience');
            }
        } catch (err) {
            console.error('Create experience error:', err);
            setError('Failed to create experience');
        } finally {
            setIsAdding(false);
        }
    };

    const handleSave = async () => {
        if (!selectedExperience?.$id) return;
        setIsSaving(true);
        setError('');
        try {
            const { $id, ...data } = selectedExperience;
            const result = await crudApi.update('experience', $id, data, user!.id);
            if (result.success) {
                setOriginalExperiences([...experiences]);
            } else {
                setError(result.error || 'Failed to save');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setExperiences([...originalExperiences]);
        setError('');
    };

    const handleDeleteExperience = async (expId: string) => {
        if (!confirm('Delete this experience?')) return;
        try {
            const result = await crudApi.delete('experience', expId, user!.id);
            if (result.success) {
                const updated = experiences.filter(e => e.$id !== expId);
                setExperiences(updated);
                setOriginalExperiences(updated);
                if (selectedId === expId) setSelectedId(null);
            }
        } catch {
            setError('Failed to delete');
        }
    };

    const updateExperience = (field: keyof Experience, value: string) => {
        if (!selectedId) return;
        setExperiences(prev => prev.map(e =>
            e.$id === selectedId ? { ...e, [field]: value } : e
        ));
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
            title="Experience"
            icon="💼"
            description="Manage your work experience timeline"
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
                    <button
                        onClick={handleAddExperience}
                        disabled={isAdding}
                        className="btn btn-primary w-full"
                    >
                        {isAdding ? (
                            <>
                                <span className="spinner !w-4 !h-4 !border-white/30 !border-t-white"></span>
                                Creating...
                            </>
                        ) : (
                            '+ Add Experience'
                        )}
                    </button>

                    {selectedExperience ? (
                        <>
                            <div className="flex items-center justify-between pb-4 border-b border-charcoal/5">
                                <h3 className="font-serif text-lg">Editing: {selectedExperience.role}</h3>
                                <button
                                    onClick={() => selectedExperience.$id && handleDeleteExperience(selectedExperience.$id)}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="field-label">Role / Title</label>
                                <input
                                    type="text"
                                    value={selectedExperience.role}
                                    onChange={(e) => updateExperience('role', e.target.value)}
                                    placeholder="Senior Developer"
                                />
                            </div>

                            {/* Company */}
                            <div>
                                <label className="field-label">Company</label>
                                <input
                                    type="text"
                                    value={selectedExperience.company}
                                    onChange={(e) => updateExperience('company', e.target.value)}
                                    placeholder="Company Name"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="field-label">Start Date</label>
                                    <input
                                        type="text"
                                        value={selectedExperience.start_date}
                                        onChange={(e) => updateExperience('start_date', e.target.value)}
                                        placeholder="2020"
                                    />
                                </div>
                                <div>
                                    <label className="field-label">End Date</label>
                                    <input
                                        type="text"
                                        value={selectedExperience.end_date}
                                        onChange={(e) => updateExperience('end_date', e.target.value)}
                                        placeholder="Present"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="field-label">Description (Optional)</label>
                                <textarea
                                    value={selectedExperience.description}
                                    onChange={(e) => updateExperience('description', e.target.value)}
                                    placeholder="Brief role description..."
                                    rows={4}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-charcoal/40">
                            <p>Click an experience in the timeline to edit</p>
                            <p className="text-sm mt-1">or add a new one</p>
                        </div>
                    )}
                </div>
            </EditorPanel>

            {/* Right Panel: Live Preview */}
            <PreviewPanel>
                <ExperiencePreview
                    experiences={previewExperiences}
                    selectedId={selectedId || undefined}
                    onSelect={setSelectedId}
                />
            </PreviewPanel>
        </EditorLayout>
    );
};
