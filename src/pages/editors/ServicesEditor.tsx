import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crudApi } from '../../lib/api';
import { EditorLayout, EditorPanel, PreviewPanel } from '../../components/EditorLayout';
import { ServicesPreview } from '../../components/preview/ServicesPreview';

interface Service {
    $id?: string;
    title: string;
    description: string;
    icon: string;
}

const emptyService: Omit<Service, '$id'> = {
    title: 'New Service',
    description: 'Service description',
    icon: '⚡'
};

export const ServicesEditor = () => {
    const { user } = useAuth();

    const [services, setServices] = useState<Service[]>([]);
    const [originalServices, setOriginalServices] = useState<Service[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const selectedService = useMemo(() =>
        services.find(s => s.$id === selectedId) || null,
        [services, selectedId]
    );

    const hasChanges = useMemo(() => {
        return JSON.stringify(services) !== JSON.stringify(originalServices);
    }, [services, originalServices]);

    // Transform for preview
    const previewServices = useMemo(() =>
        services.map(s => ({
            id: s.$id,
            title: s.title,
            description: s.description,
            icon: s.icon
        })),
        [services]
    );

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const result = await crudApi.list('services', user!.id);
            
            if (result.success) {
                setServices(result.documents || []);
                setOriginalServices(result.documents || []);
            } else {
                setError(result.error || 'Failed to load services');
            }
        } catch (err) {
            console.error('Load services error:', err);
            setError('Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddService = async () => {
        setIsAdding(true);
        setError('');
        try {
            
            const result = await crudApi.create('services', emptyService, user!.id);
            
            if (result.success && result.document) {
                const updated = [...services, result.document];
                setServices(updated);
                setOriginalServices(updated);
                setSelectedId(result.document.$id);
            } else {
                setError(result.error || 'Failed to create service');
            }
        } catch (err) {
            console.error('Create service error:', err);
            setError('Failed to create service');
        } finally {
            setIsAdding(false);
        }
    };

    const handleSave = async () => {
        if (!selectedService?.$id) return;
        setIsSaving(true);
        setError('');
        try {
            const { $id, ...data } = selectedService;
            const result = await crudApi.update('services', $id, data, user!.id);
            if (result.success) {
                setOriginalServices([...services]);
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
        setServices([...originalServices]);
        setError('');
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!confirm('Delete this service?')) return;
        try {
            const result = await crudApi.delete('services', serviceId, user!.id);
            if (result.success) {
                const updated = services.filter(s => s.$id !== serviceId);
                setServices(updated);
                setOriginalServices(updated);
                if (selectedId === serviceId) setSelectedId(null);
            }
        } catch {
            setError('Failed to delete');
        }
    };

    const updateService = (field: keyof Service, value: string) => {
        if (!selectedId) return;
        setServices(prev => prev.map(s =>
            s.$id === selectedId ? { ...s, [field]: value } : s
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
            title="Services"
            icon="⚡"
            description={`Manage the services you offer (${services.length})`}
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
                        onClick={handleAddService}
                        disabled={isAdding}
                        className="btn btn-primary w-full"
                    >
                        {isAdding ? (
                            <>
                                <span className="spinner !w-4 !h-4 !border-white/30 !border-t-white"></span>
                                Creating...
                            </>
                        ) : (
                            '+ Add Service'
                        )}
                    </button>

                    {selectedService ? (
                        <>
                            <div className="flex items-center justify-between pb-4 border-b border-charcoal/5">
                                <h3 className="font-serif text-lg">Editing: {selectedService.title}</h3>
                                <button
                                    onClick={() => selectedService.$id && handleDeleteService(selectedService.$id)}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>

                            {/* Icon */}
                            <div>
                                <label className="field-label">Icon (Emoji)</label>
                                <input
                                    type="text"
                                    value={selectedService.icon}
                                    onChange={(e) => updateService('icon', e.target.value)}
                                    placeholder="⚡"
                                    style={{ width: '80px', textAlign: 'center', fontSize: '1.5rem' }}
                                />
                                <p className="text-xs text-charcoal/40 mt-1">
                                    Use any emoji as the service icon
                                </p>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="field-label">Title</label>
                                <input
                                    type="text"
                                    value={selectedService.title}
                                    onChange={(e) => updateService('title', e.target.value)}
                                    placeholder="Web Development"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="field-label">Description</label>
                                <textarea
                                    value={selectedService.description}
                                    onChange={(e) => updateService('description', e.target.value)}
                                    placeholder="Describe the service..."
                                    rows={4}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-charcoal/40">
                            <p>Click a service card in the preview to edit</p>
                            <p className="text-sm mt-1">or add a new one</p>
                        </div>
                    )}
                </div>
            </EditorPanel>

            {/* Right Panel: Live Preview */}
            <PreviewPanel>
                <ServicesPreview
                    services={previewServices}
                    selectedId={selectedId || undefined}
                    onSelect={setSelectedId}
                />
            </PreviewPanel>
        </EditorLayout>
    );
};
