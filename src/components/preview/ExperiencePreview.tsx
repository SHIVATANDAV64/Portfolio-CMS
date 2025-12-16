import { memo } from 'react';

interface Experience {
    id?: string;
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    description?: string;
}

interface ExperiencePreviewProps {
    experiences: Experience[];
    selectedId?: string;
    onSelect?: (id: string) => void;
}

export const ExperiencePreview = memo(({ experiences, selectedId, onSelect }: ExperiencePreviewProps) => {
    return (
        <div className="relative w-full h-full bg-cream overflow-auto">
            <div className="p-8 md:p-12">
                {/* Section Header */}
                <div className="flex items-baseline gap-4 mb-8">
                    <h2 className="text-3xl font-serif font-medium text-charcoal">Experience</h2>
                </div>

                {/* Timeline */}
                {experiences.length > 0 ? (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-beige-300"></div>

                        <div className="space-y-6">
                            {experiences.map((exp, index) => (
                                <div
                                    key={exp.id || index}
                                    className={`relative pl-8 cursor-pointer group transition-all ${selectedId === exp.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                                        }`}
                                    onClick={() => exp.id && onSelect?.(exp.id)}
                                >
                                    {/* Timeline dot */}
                                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 transition-all ${selectedId === exp.id
                                            ? 'bg-olive border-olive'
                                            : 'bg-white border-beige-300 group-hover:border-olive'
                                        }`}></div>

                                    {/* Content */}
                                    <div className={`p-4 rounded-xl transition-all ${selectedId === exp.id ? 'bg-white/60' : 'group-hover:bg-white/40'
                                        }`}>
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="font-serif text-lg text-charcoal">{exp.role}</h3>
                                            <span className="text-xs text-charcoal/40 font-medium">
                                                {exp.startDate} — {exp.endDate}
                                            </span>
                                        </div>
                                        <p className="text-sm text-charcoal/60">{exp.company}</p>
                                        {exp.description && (
                                            <p className="text-sm text-charcoal/50 mt-2 leading-relaxed">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-charcoal/10 rounded-xl">
                        <p className="text-charcoal/40">No experience added yet</p>
                    </div>
                )}
            </div>
        </div>
    );
});

ExperiencePreview.displayName = 'ExperiencePreview';
