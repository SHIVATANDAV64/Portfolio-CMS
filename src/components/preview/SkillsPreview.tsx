import { memo } from 'react';

interface SkillsPreviewProps {
    techSkills: string[];
    artSkills: string[];
}

export const SkillsPreview = memo(({ techSkills, artSkills }: SkillsPreviewProps) => {
    return (
        <div className="relative w-full h-full bg-cream overflow-auto">
            <div className="p-8 md:p-12">
                {/* Section Header */}
                <div className="flex items-baseline gap-4 mb-8">
                    <h2 className="text-3xl font-serif font-medium text-charcoal">Skills</h2>
                    <span className="text-charcoal/40 text-sm">
                        ({(techSkills.length + artSkills.length).toString().padStart(2, '0')})
                    </span>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Tech Stack */}
                    <div className="p-6 bg-beige/40 rounded-xl">
                        <h3 className="font-serif text-xl mb-4 text-charcoal">Tech Stack</h3>
                        <ul className="space-y-2 text-sm uppercase tracking-wide text-charcoal/60">
                            {techSkills.length > 0 ? (
                                techSkills.map((skill, i) => (
                                    <li key={i} className="pb-2 border-b border-charcoal/5 last:border-0">
                                        {skill}
                                    </li>
                                ))
                            ) : (
                                <li className="italic text-charcoal/30 normal-case">No tech skills yet</li>
                            )}
                        </ul>
                    </div>

                    {/* Art Mediums */}
                    <div className="p-6 bg-beige/40 rounded-xl">
                        <h3 className="font-serif text-xl mb-4 text-charcoal">Art Mediums</h3>
                        <ul className="space-y-2 text-sm uppercase tracking-wide text-charcoal/60">
                            {artSkills.length > 0 ? (
                                artSkills.map((skill, i) => (
                                    <li key={i} className="pb-2 border-b border-charcoal/5 last:border-0">
                                        {skill}
                                    </li>
                                ))
                            ) : (
                                <li className="italic text-charcoal/30 normal-case">No art skills yet</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
});

SkillsPreview.displayName = 'SkillsPreview';
