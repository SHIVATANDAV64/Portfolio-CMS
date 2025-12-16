import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crudApi } from '../../lib/api';
import { EditorLayout, EditorPanel, PreviewPanel } from '../../components/EditorLayout';
import { SkillsPreview } from '../../components/preview/SkillsPreview';

interface Skill {
    $id?: string;
    name: string;
    category: string;
    icon: string;
}

export const SkillsEditor = () => {
    const { user } = useAuth();

    const [skills, setSkills] = useState<Skill[]>([]);
    const [originalSkills, setOriginalSkills] = useState<Skill[]>([]);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('tech');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Check for unsaved changes
    const hasChanges = useMemo(() => {
        return JSON.stringify(skills) !== JSON.stringify(originalSkills);
    }, [skills, originalSkills]);

    // Separate skills by category for preview
    const techSkills = useMemo(() =>
        skills.filter(s => s.category?.toLowerCase() === 'tech').map(s => s.name),
        [skills]
    );
    const artSkills = useMemo(() =>
        skills.filter(s => s.category?.toLowerCase() === 'art').map(s => s.name),
        [skills]
    );

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        setIsLoading(true);
        try {
            const result = await crudApi.list('skills', user!.id);
            
            if (result.success) {
                setSkills(result.documents || []);
                setOriginalSkills(result.documents || []);
            } else {
                setError(result.error || 'Failed to load skills');
            }
        } catch (err) {
            console.error('Load skills error:', err);
            setError('Failed to load skills');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSkill = async () => {
        if (!newSkillName.trim()) return;
        setIsAdding(true);
        setError('');
        try {
            
            const result = await crudApi.create('skills', {
                name: newSkillName,
                category: newSkillCategory,
                icon: ''
            }, user!.id);
            
            if (result.success && result.document) {
                const updated = [...skills, result.document];
                setSkills(updated);
                setOriginalSkills(updated);
                setNewSkillName('');
            } else {
                setError(result.error || 'Failed to add skill');
            }
        } catch (err) {
            console.error('Add skill error:', err);
            setError('Failed to add skill');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteSkill = async (skillId: string) => {
        try {
            const result = await crudApi.delete('skills', skillId, user!.id);
            if (result.success) {
                const updated = skills.filter(s => s.$id !== skillId);
                setSkills(updated);
                setOriginalSkills(updated);
            }
        } catch {
            setError('Failed to delete skill');
        }
    };

    const handleStartEdit = (skill: Skill) => {
        if (skill.$id) {
            setEditingId(skill.$id);
            setEditingName(skill.name);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editingName.trim()) return;
        setIsSaving(true);
        setError('');
        try {
            const skill = skills.find(s => s.$id === editingId);
            if (!skill) return;

            const result = await crudApi.update('skills', editingId, {
                name: editingName,
                category: skill.category,
                icon: skill.icon || ''
            }, user!.id);

            if (result.success) {
                const updated = skills.map(s =>
                    s.$id === editingId ? { ...s, name: editingName } : s
                );
                setSkills(updated);
                setOriginalSkills(updated);
                setEditingId(null);
                setEditingName('');
            } else {
                setError(result.error || 'Failed to update skill');
            }
        } catch {
            setError('Failed to update skill');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        // All changes are saved immediately
        setOriginalSkills([...skills]);
    };

    const handleDiscard = () => {
        setSkills([...originalSkills]);
        setEditingId(null);
        setEditingName('');
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
            title="Skills"
            icon="🛠️"
            description={`Manage your skills and expertise (${skills.length})`}
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
                    {/* Add New Skill */}
                    <div className="p-4 bg-cream-100 rounded-xl" style={{ backgroundColor: '#F0F0EB' }}>
                        <h3 className="font-serif text-lg mb-4">Add New Skill</h3>
                        <div className="flex gap-2 flex-wrap">
                            <input
                                type="text"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                placeholder="e.g., React, Python, Illustration"
                                style={{ flex: 1, minWidth: '150px' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                            />
                            <select
                                value={newSkillCategory === 'custom' ? 'custom' : newSkillCategory}
                                onChange={(e) => {
                                    if (e.target.value === 'custom') {
                                        setNewSkillCategory('');
                                    } else {
                                        setNewSkillCategory(e.target.value);
                                    }
                                }}
                                style={{ width: '120px' }}
                            >
                                <option value="tech">Tech</option>
                                <option value="art">Art</option>
                                {/* Show other unique categories from existing skills */}
                                {[...new Set(skills.map(s => s.category?.toLowerCase()))]
                                    .filter(c => c && !['tech', 'art'].includes(c))
                                    .map(cat => (
                                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                    ))
                                }
                                <option value="custom">+ Custom...</option>
                            </select>
                            {newSkillCategory === '' && (
                                <input
                                    type="text"
                                    placeholder="New category name"
                                    onChange={(e) => setNewSkillCategory(e.target.value.toLowerCase())}
                                    style={{ width: '130px' }}
                                />
                            )}
                            <button
                                onClick={handleAddSkill}
                                disabled={isAdding || !newSkillName.trim() || !newSkillCategory}
                                className="btn btn-primary"
                                style={{ minWidth: '80px' }}
                            >
                                {isAdding ? '...' : 'Add'}
                            </button>
                        </div>
                    </div>

                    {/* Existing Skills */}
                    <div className="space-y-4">
                        {/* Tech Skills */}
                        <div>
                            <h3 className="field-label mb-3">Tech Stack ({skills.filter(s => s.category?.toLowerCase() === 'tech').length})</h3>
                            <div className="space-y-2">
                                {skills.filter(s => s.category?.toLowerCase() === 'tech').map((skill) => (
                                    <div key={skill.$id} className="flex items-center justify-between p-3 rounded-xl gap-2" style={{ backgroundColor: '#F0F0EB' }}>
                                        {editingId === skill.$id ? (
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onBlur={handleSaveEdit}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit();
                                                    if (e.key === 'Escape') handleCancelEdit();
                                                }}
                                                autoFocus
                                                className="text-sm flex-1"
                                                style={{ padding: '4px 8px' }}
                                            />
                                        ) : (
                                            <span
                                                className="text-sm flex-1 cursor-pointer hover:text-olive transition-colors"
                                                onClick={() => handleStartEdit(skill)}
                                                title="Click to edit"
                                            >
                                                {skill.name}
                                            </span>
                                        )}
                                        <div className="flex gap-1">
                                            {editingId !== skill.$id && (
                                                <button
                                                    onClick={() => handleStartEdit(skill)}
                                                    className="text-charcoal/30 hover:text-olive transition-colors"
                                                    style={{ padding: '4px' }}
                                                    title="Edit"
                                                >
                                                    ✎
                                                </button>
                                            )}
                                            <button
                                                onClick={() => skill.$id && handleDeleteSkill(skill.$id)}
                                                className="text-charcoal/30 hover:text-red-500 transition-colors"
                                                style={{ padding: '4px' }}
                                                title="Delete"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {skills.filter(s => s.category?.toLowerCase() === 'tech').length === 0 && (
                                    <p className="text-sm text-charcoal/40 italic">No tech skills yet</p>
                                )}
                            </div>
                        </div>

                        {/* Art Skills */}
                        <div>
                            <h3 className="field-label mb-3">Art Mediums ({skills.filter(s => s.category?.toLowerCase() === 'art').length})</h3>
                            <div className="space-y-2">
                                {skills.filter(s => s.category?.toLowerCase() === 'art').map((skill) => (
                                    <div key={skill.$id} className="flex items-center justify-between p-3 rounded-xl gap-2" style={{ backgroundColor: '#F0F0EB' }}>
                                        {editingId === skill.$id ? (
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onBlur={handleSaveEdit}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit();
                                                    if (e.key === 'Escape') handleCancelEdit();
                                                }}
                                                autoFocus
                                                className="text-sm flex-1"
                                                style={{ padding: '4px 8px' }}
                                            />
                                        ) : (
                                            <span
                                                className="text-sm flex-1 cursor-pointer hover:text-olive transition-colors"
                                                onClick={() => handleStartEdit(skill)}
                                                title="Click to edit"
                                            >
                                                {skill.name}
                                            </span>
                                        )}
                                        <div className="flex gap-1">
                                            {editingId !== skill.$id && (
                                                <button
                                                    onClick={() => handleStartEdit(skill)}
                                                    className="text-charcoal/30 hover:text-olive transition-colors"
                                                    style={{ padding: '4px' }}
                                                    title="Edit"
                                                >
                                                    ✎
                                                </button>
                                            )}
                                            <button
                                                onClick={() => skill.$id && handleDeleteSkill(skill.$id)}
                                                className="text-charcoal/30 hover:text-red-500 transition-colors"
                                                style={{ padding: '4px' }}
                                                title="Delete"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {skills.filter(s => s.category?.toLowerCase() === 'art').length === 0 && (
                                    <p className="text-sm text-charcoal/40 italic">No art skills yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </EditorPanel>

            {/* Right Panel: Live Preview */}
            <PreviewPanel>
                <SkillsPreview
                    techSkills={techSkills}
                    artSkills={artSkills}
                />
            </PreviewPanel>
        </EditorLayout>
    );
};
