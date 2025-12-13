import { useAuth } from '../context/AuthContext';
import { COLLECTIONS } from '../lib/api';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Admin'}</h1>
                <p className="text-[var(--muted)] mt-2">
                    Manage your portfolio content from here.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {COLLECTIONS.map((collection) => (
                    <Link
                        key={collection.name}
                        to={`/dashboard/${collection.name}`}
                        className="card hover:border-[var(--primary)] transition-colors group"
                    >
                        <div className="text-4xl mb-4">{collection.icon}</div>
                        <h3 className="text-xl font-semibold group-hover:text-[var(--primary)] transition-colors">
                            {collection.label}
                        </h3>
                        <p className="text-sm text-[var(--muted)] mt-2">
                            Manage {collection.label.toLowerCase()} content
                        </p>
                    </Link>
                ))}
            </div>

            <div className="mt-12 card">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link to="/dashboard/projects" className="btn btn-primary">
                        + Add Project
                    </Link>
                    <Link to="/dashboard/skills" className="btn btn-ghost">
                        + Add Skill
                    </Link>
                    <Link to="/dashboard/messages" className="btn btn-ghost">
                        View Messages
                    </Link>
                </div>
            </div>
        </div>
    );
};
