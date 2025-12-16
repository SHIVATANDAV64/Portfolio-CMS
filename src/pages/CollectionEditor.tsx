import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { crudApi, COLLECTIONS, type CollectionName } from '../lib/api';

// Field configurations for each collection
const COLLECTION_FIELDS: Record<CollectionName, { name: string; type: 'text' | 'textarea' | 'url' | 'email' }[]> = {
    hero: [
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'cta_text', type: 'text' },
        { name: 'cta_link', type: 'url' }
    ],
    about: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image_url', type: 'url' }
    ],
    skills: [
        { name: 'name', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'icon', type: 'text' }
    ],
    projects: [
        { name: 'title', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'year', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image_pc', type: 'url' },
        { name: 'image_mobile', type: 'url' },
        { name: 'link', type: 'url' }
    ],
    experience: [
        { name: 'role', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'start_date', type: 'text' },
        { name: 'end_date', type: 'text' },
        { name: 'description', type: 'textarea' }
    ],
    services: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'icon', type: 'text' }
    ],
    social_links: [
        { name: 'platform', type: 'text' },
        { name: 'url', type: 'url' },
        { name: 'icon', type: 'text' }
    ],
    messages: [
        { name: 'name', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'subject', type: 'text' },
        { name: 'message', type: 'textarea' }
    ]
};

export const CollectionEditor = () => {
    const { collectionName, documentId } = useParams<{ collectionName: string; documentId?: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const isNew = documentId === 'new';
    const collection = COLLECTIONS.find(c => c.name === collectionName);
    const fields = COLLECTION_FIELDS[collectionName as CollectionName] || [];

    useEffect(() => {
        if (!isNew && documentId && user) {
            loadDocument();
        }
    }, [documentId, user]);

    const loadDocument = async () => {
        setIsLoading(true);
        try {
            const result = await crudApi.get(collectionName as CollectionName, documentId!, user!.id);
            if (result.success && result.document) {
                const data: Record<string, string> = {};
                fields.forEach(field => {
                    data[field.name] = (result.document[field.name] as string) || '';
                });
                setFormData(data);
            } else {
                setError(result.error || 'Failed to load');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const result = isNew
                ? await crudApi.create(collectionName as CollectionName, formData, user!.id)
                : await crudApi.update(collectionName as CollectionName, documentId!, formData, user!.id);

            if (result.success) {
                navigate(`/dashboard/${collectionName}`);
            } else {
                setError(result.error || 'Failed to save');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!collection) {
        return <div className="text-center py-12">Collection not found</div>;
    }

    if (isLoading) {
        return <div className="text-center py-12 text-[var(--muted)]">Loading...</div>;
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <Link
                    to={`/dashboard/${collectionName}`}
                    className="text-[var(--muted)] hover:text-white mb-4 inline-block"
                >
                    ← Back to {collection.label}
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <span>{collection.icon}</span>
                    {isNew ? `New ${collection.label}` : `Edit ${collection.label}`}
                </h1>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-[var(--destructive)]/10 text-[var(--destructive)] mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card space-y-6">
                {fields.map((field) => (
                    <div key={field.name}>
                        <label className="block text-sm font-medium mb-2 capitalize">
                            {field.name.replace(/_/g, ' ')}
                        </label>
                        {field.type === 'textarea' ? (
                            <textarea
                                value={formData[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        ) : (
                            <input
                                type={field.type}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn btn-primary"
                    >
                        {isSaving ? 'Saving...' : isNew ? 'Create' : 'Save Changes'}
                    </button>
                    <Link
                        to={`/dashboard/${collectionName}`}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
};
