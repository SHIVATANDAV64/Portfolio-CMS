import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { crudApi } from '../lib/api';

const sections = [
    {
        name: 'hero',
        label: 'Hero Section',
        icon: '🏠',
        description: 'Landing page title, subtitle, and call-to-action'
    },
    {
        name: 'about',
        label: 'About',
        icon: '👤',
        description: 'Your story, skills, and profile image'
    },
    {
        name: 'projects',
        label: 'Projects',
        icon: '📁',
        description: 'Portfolio work showcase'
    },
    {
        name: 'skills',
        label: 'Skills',
        icon: '🛠️',
        description: 'Tech stack and expertise'
    },
    {
        name: 'experience',
        label: 'Experience',
        icon: '💼',
        description: 'Work history timeline'
    },
    {
        name: 'services',
        label: 'Services',
        icon: '⚡',
        description: 'Services you offer'
    },
    {
        name: 'social_links',
        label: 'Social Links',
        icon: '🔗',
        description: 'Social media profiles'
    },
    {
        name: 'messages',
        label: 'Messages',
        icon: '📧',
        description: 'Contact form submissions'
    }
];

interface DashboardStats {
    projects: number;
    skills: number;
    messages: number;
    isLive: boolean;
}

export const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        projects: 0,
        skills: 0,
        messages: 0,
        isLive: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            try {
                const [projectsRes, skillsRes, messagesRes] = await Promise.all([
                    crudApi.list('projects', user.id),
                    crudApi.list('skills', user.id),
                    crudApi.list('messages', user.id)
                ]);

                setStats({
                    projects: projectsRes.documents?.length || 0,
                    skills: skillsRes.documents?.length || 0,
                    messages: messagesRes.documents?.length || 0,
                    isLive: true // TODO: Check actual deployment status
                });
            } catch (err) {
                console.error('Failed to load stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-serif">
                    Welcome back, <span className="text-[var(--olive)]">{user?.name || 'Admin'}</span>
                </h1>
                <p className="text-[var(--muted)] mt-2">
                    Manage your portfolio content
                </p>
            </div>

            {/* Section Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <Link
                        key={section.name}
                        to={`/dashboard/${section.name}`}
                        className="card card-interactive group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <span className="text-4xl group-hover:scale-110 transition-transform">
                                {section.icon}
                            </span>
                            <svg
                                className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--olive)] group-hover:translate-x-1 transition-all"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h3 className="font-serif text-xl group-hover:text-[var(--olive)] transition-colors">
                            {section.label}
                        </h3>
                        <p className="text-sm text-[var(--muted)] mt-1">
                            {section.description}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="card text-center">
                    <p className="text-3xl font-serif text-[var(--olive)]">
                        {loading ? '...' : stats.projects}
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-1">Projects</p>
                </div>
                <div className="card text-center">
                    <p className="text-3xl font-serif text-[var(--olive)]">
                        {loading ? '...' : stats.skills}
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-1">Skills</p>
                </div>
                <div className="card text-center">
                    <p className="text-3xl font-serif text-[var(--olive)]">
                        {loading ? '...' : stats.messages}
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-1">Messages</p>
                </div>
                <div className="card text-center">
                    <p className={`text-3xl font-serif ${stats.isLive ? 'text-green-500' : 'text-[var(--terracotta)]'}`}>
                        {loading ? '...' : (stats.isLive ? '●' : '○')}
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-1">Site Live</p>
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-sm text-[var(--muted)] pt-8">
                <p>Click any section above to edit its content with live preview</p>
            </div>
        </div>
    );
};
