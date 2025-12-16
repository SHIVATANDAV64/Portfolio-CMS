import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { crudApi, COLLECTIONS, type CollectionName } from '../lib/api';

interface Document {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    [key: string]: unknown;
}

export const CollectionList = () => {
    const { collectionName } = useParams<{ collectionName: string }>();
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const collection = COLLECTIONS.find(c => c.name === collectionName);

    useEffect(() => {
        if (user && collectionName) {
            loadDocuments();
        }
    }, [user, collectionName]);

    const loadDocuments = async () => {
        setIsLoading(true);
        setError('');

        try {
            const result = await crudApi.list(collectionName as CollectionName, user!.id);
            if (result.success) {
                setDocuments(result.documents || []);
            } else {
                setError(result.error || 'Failed to load');
            }
        } catch {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const result = await crudApi.delete(collectionName as CollectionName, docId, user!.id);
            if (result.success) {
                setDocuments(docs => docs.filter(d => d.$id !== docId));
            } else {
                setError(result.error || 'Failed to delete');
            }
        } catch {
            setError('Network error');
        }
    };

    const getDisplayValue = (doc: Document): string => {
        // Try common field names for display
        const displayFields = ['title', 'name', 'role', 'platform', 'subject', 'email'];
        for (const field of displayFields) {
            if (doc[field] && typeof doc[field] === 'string') {
                return doc[field] as string;
            }
        }
        return doc.$id;
    };

    if (!collection) {
        return <div className="text-center py-12">Collection not found</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <span>{collection.icon}</span>
                        {collection.label}
                    </h1>
                    <p className="text-[var(--muted)] mt-2">
                        {documents.length} items
                    </p>
                </div>
                <Link
                    to={`/dashboard/${collectionName}/new`}
                    className="btn btn-primary"
                >
                    + Add New
                </Link>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-[var(--destructive)]/10 text-[var(--destructive)] mb-6">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12 text-[var(--muted)]">
                    Loading...
                </div>
            ) : documents.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-[var(--muted)] mb-4">No items yet</p>
                    <Link
                        to={`/dashboard/${collectionName}/new`}
                        className="btn btn-primary"
                    >
                        Create your first {collection.label.toLowerCase()}
                    </Link>
                </div>
            ) : (
                <div className="card overflow-hidden p-0">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Created</th>
                                <th>Updated</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc.$id}>
                                    <td className="font-medium">
                                        {getDisplayValue(doc)}
                                    </td>
                                    <td className="text-[var(--muted)]">
                                        {new Date(doc.$createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="text-[var(--muted)]">
                                        {new Date(doc.$updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/dashboard/${collectionName}/${doc.$id}`}
                                                className="btn btn-ghost py-2 px-3"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(doc.$id)}
                                                className="btn btn-destructive py-2 px-3"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
