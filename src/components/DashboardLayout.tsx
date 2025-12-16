import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLLECTIONS } from '../lib/api';

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="flex min-h-screen bg-cream">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-charcoal/8 flex flex-col flex-shrink-0">
                {/* Logo */}
                <div className="p-6 border-b border-charcoal/5">
                    <Link to="/dashboard" className="block">
                        <h1 className="text-xl font-serif tracking-tight text-charcoal">
                            Portfolio
                            <span className="text-olive italic ml-1">CMS</span>
                        </h1>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {/* Dashboard Link */}
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${location.pathname === '/dashboard'
                                ? 'bg-olive text-white'
                                : 'text-charcoal/70 hover:bg-cream hover:text-charcoal'
                            }`}
                    >
                        <span>📊</span>
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    {/* Section Divider */}
                    <div className="pt-4 pb-2">
                        <span className="text-[10px] font-medium text-charcoal/40 uppercase tracking-wider px-4">
                            Content
                        </span>
                    </div>

                    {/* Collection Links */}
                    {COLLECTIONS.map((collection) => {
                        const isActive = location.pathname.includes(`/dashboard/${collection.name}`);
                        return (
                            <Link
                                key={collection.name}
                                to={`/dashboard/${collection.name}`}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                                        ? 'bg-olive text-white'
                                        : 'text-charcoal/70 hover:bg-cream hover:text-charcoal'
                                    }`}
                            >
                                <span>{collection.icon}</span>
                                <span className="font-medium">{collection.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-charcoal/5">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                        <div className="w-9 h-9 rounded-full bg-olive/10 flex items-center justify-center text-sm font-medium text-olive">
                            {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-charcoal truncate">
                                {user?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-charcoal/40 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-charcoal/50 hover:bg-cream hover:text-charcoal transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
