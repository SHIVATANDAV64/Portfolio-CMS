import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crudApi } from '../../lib/api';
import { EditorLayout, EditorPanel, PreviewPanel } from '../../components/EditorLayout';
import { ProjectsPreview } from '../../components/preview/ProjectCard';
import { ImageUpload } from '../../components/ImageUpload';

interface Project {
    $id?: string;
    title: string;
    category: string;
    year: string;
    description: string;
    image_pc: string;
    image_mobile: string;
    link: string;
}

const emptyProject: Omit<Project, '$id'> = {
    title: 'New Project',
    category: 'Web Design',
    year: new Date().getFullYear().toString(),
    description: '',
    image_pc: 'https://placehold.co/1200x800/2A2A2A/FAFAF5?text=Desktop+Preview',
    image_mobile: 'https://placehold.co/400x800/2A2A2A/FAFAF5?text=Mobile+Preview',
    link: 'https://example.com'
};

export const WorkEditor = () => {
    const { user } = useAuth();

    const [projects, setProjects] = useState<Project[]>([]);
    const [originalProjects, setOriginalProjects] = useState<Project[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const selectedProject = useMemo(() =>
        projects.find(p => p.$id === selectedId) || null,
        [projects, selectedId]
    );

    // For now, we only track if a specific project is being edited
    const hasChanges = useMemo(() => {
        return JSON.stringify(projects) !== JSON.stringify(originalProjects);
    }, [projects, originalProjects]);

    // Transform for preview
    const previewProjects = useMemo(() =>
        projects.map(p => ({
            id: p.$id,
            title: p.title,
            category: p.category,
            year: p.year,
            imageUrl: p.image_pc
        })),
        [projects]
    );

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const result = await crudApi.list('projects', user!.id);
            
            if (result.success) {
                setProjects(result.documents || []);
                setOriginalProjects(result.documents || []);
            } else {
                setError(result.error || 'Failed to load projects');
            }
        } catch (err) {
            console.error('Load projects error:', err);
            setError('Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProject = async () => {
        setIsAdding(true);
        setError('');
        try {
            
            const result = await crudApi.create('projects', emptyProject, user!.id);
            
            if (result.success && result.document) {
                const newProjects = [...projects, result.document];
                setProjects(newProjects);
                setOriginalProjects(newProjects);
                setSelectedId(result.document.$id);
            } else {
                setError(result.error || 'Failed to create project');
            }
        } catch (err) {
            console.error('Create project error:', err);
            setError('Failed to create project');
        } finally {
            setIsAdding(false);
        }
    };

    const handleSave = async () => {
        if (!selectedProject?.$id) return;
        setIsSaving(true);
        setError('');
        try {
            const { $id, ...data } = selectedProject;
            const result = await crudApi.update('projects', $id, data, user!.id);
            if (result.success) {
                setOriginalProjects([...projects]);
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
        setProjects([...originalProjects]);
        setError('');
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Delete this project?')) return;
        try {
            const result = await crudApi.delete('projects', projectId, user!.id);
            if (result.success) {
                const newProjects = projects.filter(p => p.$id !== projectId);
                setProjects(newProjects);
                setOriginalProjects(newProjects);
                if (selectedId === projectId) setSelectedId(null);
            }
        } catch {
            setError('Failed to delete project');
        }
    };

    const updateProject = (field: keyof Project, value: string) => {
        if (!selectedId) return;
        setProjects(prev => prev.map(p =>
            p.$id === selectedId ? { ...p, [field]: value } : p
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
            title="Projects"
            icon="📁"
            description={`Manage your portfolio projects (${projects.length})`}
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
                        onClick={handleAddProject}
                        disabled={isAdding}
                        className="btn btn-primary w-full"
                    >
                        {isAdding ? (
                            <>
                                <span className="spinner !w-4 !h-4 !border-white/30 !border-t-white"></span>
                                Creating...
                            </>
                        ) : (
                            '+ Add New Project'
                        )}
                    </button>

                    {selectedProject ? (
                        <>
                            <div className="flex items-center justify-between pb-4 border-b border-charcoal/5">
                                <h3 className="font-serif text-lg">Editing: {selectedProject.title}</h3>
                                <button
                                    onClick={() => selectedProject.$id && handleDeleteProject(selectedProject.$id)}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="field-label">Title</label>
                                <input
                                    type="text"
                                    value={selectedProject.title}
                                    onChange={(e) => updateProject('title', e.target.value)}
                                />
                            </div>

                            {/* Category & Year */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="field-label">Category</label>
                                    <input
                                        type="text"
                                        value={selectedProject.category}
                                        onChange={(e) => updateProject('category', e.target.value)}
                                        placeholder="Web Design"
                                    />
                                </div>
                                <div>
                                    <label className="field-label">Year</label>
                                    <input
                                        type="text"
                                        value={selectedProject.year}
                                        onChange={(e) => updateProject('year', e.target.value)}
                                        placeholder="2024"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="field-label">Description</label>
                                <textarea
                                    value={selectedProject.description}
                                    onChange={(e) => updateProject('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Link */}
                            <div>
                                <label className="field-label">Project Link</label>
                                <input
                                    type="url"
                                    value={selectedProject.link}
                                    onChange={(e) => updateProject('link', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Images */}
                            <div className="grid grid-cols-2 gap-4">
                                <ImageUpload
                                    label="Desktop Image"
                                    value={selectedProject.image_pc}
                                    onChange={(url) => updateProject('image_pc', url)}
                                    aspect="desktop"
                                    placeholder="Upload desktop preview"
                                />
                                <ImageUpload
                                    label="Mobile Image"
                                    value={selectedProject.image_mobile}
                                    onChange={(url) => updateProject('image_mobile', url)}
                                    aspect="mobile"
                                    placeholder="Upload mobile preview"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-charcoal/40">
                            <p>Select a project from the preview to edit</p>
                            <p className="text-sm mt-1">or create a new one</p>
                        </div>
                    )}
                </div>
            </EditorPanel>

            {/* Right Panel: Live Preview */}
            <PreviewPanel>
                <ProjectsPreview
                    projects={previewProjects}
                    selectedId={selectedId || undefined}
                    onSelectProject={setSelectedId}
                />
            </PreviewPanel>
        </EditorLayout>
    );
};
