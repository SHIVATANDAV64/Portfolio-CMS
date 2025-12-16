import { memo } from 'react';

interface Project {
    id?: string;
    title: string;
    category: string;
    year: string;
    imageUrl: string;
}

interface ProjectCardProps {
    project: Project;
    isSelected?: boolean;
    onClick?: () => void;
}

export const ProjectCard = memo(({ project, isSelected, onClick }: ProjectCardProps) => {
    return (
        <div
            onClick={onClick}
            className={`relative rounded-xl overflow-hidden aspect-[16/10] cursor-pointer group transition-all duration-300 bg-charcoal/10 ${isSelected ? 'ring-2 ring-olive scale-[1.02]' : ''
                }`}
        >
            {/* Image */}
            {project.imageUrl ? (
                <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-beige to-cream-300 flex items-center justify-center">
                    <span className="text-charcoal/30 text-lg font-serif">{project.title}</span>
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-serif font-medium mb-1">{project.title}</h3>
                <div className="flex gap-3 text-[10px] uppercase tracking-widest opacity-80">
                    <span>{project.category}</span>
                    <span>—</span>
                    <span>{project.year}</span>
                </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-olive/0 group-hover:bg-olive/10 transition-colors" />
        </div>
    );
});

ProjectCard.displayName = 'ProjectCard';

// Projects Grid Preview
interface ProjectsPreviewProps {
    projects: Project[];
    selectedId?: string;
    onSelectProject?: (id: string) => void;
}

export const ProjectsPreview = memo(({ projects, selectedId, onSelectProject }: ProjectsPreviewProps) => {
    return (
        <div className="relative w-full h-full bg-cream overflow-auto">
            <div className="p-8 md:p-12">
                {/* Section Header */}
                <div className="flex items-baseline gap-4 mb-8">
                    <h2 className="text-3xl font-serif font-medium text-charcoal">Work</h2>
                    <span className="text-charcoal/40 text-sm">({projects.length.toString().padStart(2, '0')})</span>
                </div>

                {/* Projects Grid */}
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id || project.title}
                                project={project}
                                isSelected={selectedId === project.id}
                                onClick={() => project.id && onSelectProject?.(project.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-charcoal/10 rounded-xl">
                        <p className="text-charcoal/40">No projects yet</p>
                    </div>
                )}
            </div>
        </div>
    );
});

ProjectsPreview.displayName = 'ProjectsPreview';
