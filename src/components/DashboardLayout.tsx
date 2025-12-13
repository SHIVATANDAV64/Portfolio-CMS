import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLLECTIONS } from '../lib/api';

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
                <div className="p-6 border-b border-[var(--border)]">
                    <h1 className="text-xl font-bold">Portfolio CMS</h1>
                    <p className="text-sm text-[var(--muted)] mt-1">{user?.email}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/dashboard'
                                ? 'bg-[var(--primary)] text-white'
                                : 'hover:bg-[var(--card-hover)]'
                            }`}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </Link>

                    <div className="pt-4 pb-2">
                        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider px-4">
                            Content
                        </span>
                    </div>

                    {COLLECTIONS.map((collection) => (
                        <Link
                            key={collection.name}
                            to={`/dashboard/${collection.name}`}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === `/dashboard/${collection.name}`
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'hover:bg-[var(--card-hover)]'
                                }`}
                        >
                            <span>{collection.icon}</span>
                            <span>{collection.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--border)]">
                    <button
                        onClick={logout}
                        className="btn btn-ghost w-full justify-start"
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
