import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error || 'Login failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-olive/5 to-transparent blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-terracotta/5 to-transparent blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Title */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-charcoal">
                        Portfolio
                        <span className="block text-olive italic mt-1">CMS</span>
                    </h1>
                    <p className="text-charcoal/50 text-sm mt-4 tracking-wide">
                        Manage your digital presence
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 md:p-10 border border-white/50 shadow-xl shadow-charcoal/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="field-label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="field-label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full py-4"
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner !w-4 !h-4 !border-white/30 !border-t-white"></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer note */}
                <p className="text-center mt-8 text-xs text-charcoal/40">
                    Access restricted to authorized administrators
                </p>
            </div>
        </div>
    );
};
