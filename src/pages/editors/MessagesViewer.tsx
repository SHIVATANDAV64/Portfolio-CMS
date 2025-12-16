import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { crudApi } from '../../lib/api';

interface Message {
    $id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    $createdAt?: string;
}

export const MessagesViewer = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            const result = await crudApi.list('messages', user!.id);
            if (result.success) {
                setMessages(result.documents || []);
            }
        } catch {
            setError('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this message?')) return;
        try {
            const result = await crudApi.delete('messages', id, user!.id);
            if (result.success) {
                setMessages(prev => prev.filter(m => m.$id !== id));
                if (selectedMessage?.$id === id) setSelectedMessage(null);
            }
        } catch {
            setError('Failed to delete');
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="spinner"></div>
            </div>
        );
    }

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
                        <span>📧</span>
                        Messages
                        <span className="text-lg text-charcoal/40 font-normal ml-2">({messages.length})</span>
                    </h1>
                    <p className="section-subtitle">Contact form submissions</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
                {/* Message List */}
                <div className="editor-panel col-span-1 !p-4">
                    <div className="space-y-2 overflow-y-auto h-full">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-4xl mb-4 block">📭</span>
                                <p className="text-charcoal/40">No messages yet</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.$id}
                                    onClick={() => setSelectedMessage(message)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedMessage?.$id === message.$id
                                            ? 'bg-olive/10 border-l-2 border-olive'
                                            : 'bg-cream hover:bg-cream-100'
                                        }`}
                                >
                                    <div className="flex items-baseline justify-between mb-1">
                                        <h4 className="font-medium text-sm truncate">{message.name}</h4>
                                        <span className="text-[10px] text-charcoal/40 flex-shrink-0 ml-2">
                                            {formatDate(message.$createdAt)?.split(',')[0]}
                                        </span>
                                    </div>
                                    <p className="text-xs text-charcoal/50 truncate">{message.email}</p>
                                    <p className="text-sm mt-2 truncate text-charcoal/70">
                                        {message.subject || 'No subject'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Detail */}
                <div className="preview-panel col-span-2 flex flex-col">
                    {selectedMessage ? (
                        <div className="flex-1 p-8 overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-8 pb-6 border-b border-charcoal/5">
                                <div>
                                    <h2 className="font-serif text-2xl text-charcoal">{selectedMessage.name}</h2>
                                    <a
                                        href={`mailto:${selectedMessage.email}`}
                                        className="text-olive hover:underline"
                                    >
                                        {selectedMessage.email}
                                    </a>
                                    <p className="text-sm text-charcoal/40 mt-2">
                                        Received: {formatDate(selectedMessage.$createdAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => selectedMessage.$id && handleDelete(selectedMessage.$id)}
                                    className="btn btn-ghost text-red-500 hover:bg-red-50"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>

                            {/* Subject */}
                            {selectedMessage.subject && (
                                <div className="mb-6">
                                    <span className="field-label">Subject</span>
                                    <p className="font-serif text-lg">{selectedMessage.subject}</p>
                                </div>
                            )}

                            {/* Message Body */}
                            <div>
                                <span className="field-label">Message</span>
                                <div className="mt-3 p-6 bg-cream-100 rounded-xl">
                                    <p className="whitespace-pre-wrap leading-relaxed text-charcoal/80">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            {/* Reply Button */}
                            <div className="mt-8">
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || ''}`}
                                    className="btn btn-primary"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-6 9 6-9 6-9-6z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10" />
                                    </svg>
                                    Reply via Email
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-5xl mb-4 block">📬</span>
                                <p className="text-charcoal/40">Select a message to read</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
