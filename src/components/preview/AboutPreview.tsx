import { memo } from 'react';

interface AboutPreviewProps {
    title: string;
    description: string;
    imageUrl: string;
    techSkills: string[];
    artSkills: string[];
}

export const AboutPreview = memo(({
    title,
    description,
    imageUrl,
    techSkills,
    artSkills
}: AboutPreviewProps) => {
    return (
        <div className="relative w-full h-full bg-cream overflow-auto">
            <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Content */}
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-serif font-medium text-charcoal leading-tight">
                            {title || 'The Dual Creator'}
                        </h2>
                        <p className="text-charcoal/70 leading-relaxed">
                            {description || 'My journey exists at the intersection of logic and emotion.'}
                        </p>

                        {/* Skills Boxes */}
                        <div className="flex gap-4 pt-4">
                            {/* Tech Stack */}
                            <div className="flex-1 p-4 bg-beige/40 rounded-xl">
                                <h3 className="font-serif text-sm font-medium mb-3 text-charcoal">Tech Stack</h3>
                                <ul className="space-y-1.5 text-[10px] uppercase tracking-wide text-charcoal/60">
                                    {techSkills.length > 0 ? (
                                        techSkills.slice(0, 5).map((skill, i) => (
                                            <li key={i}>{skill}</li>
                                        ))
                                    ) : (
                                        <>
                                            <li>React</li>
                                            <li>TypeScript</li>
                                            <li>Node.js</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Art Mediums */}
                            <div className="flex-1 p-4 bg-beige/40 rounded-xl">
                                <h3 className="font-serif text-sm font-medium mb-3 text-charcoal">Art Mediums</h3>
                                <ul className="space-y-1.5 text-[10px] uppercase tracking-wide text-charcoal/60">
                                    {artSkills.length > 0 ? (
                                        artSkills.slice(0, 5).map((skill, i) => (
                                            <li key={i}>{skill}</li>
                                        ))
                                    ) : (
                                        <>
                                            <li>Digital Art</li>
                                            <li>Illustration</li>
                                            <li>UI Design</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="relative">
                        <div className="aspect-[3/4] bg-beige-200 rounded-xl overflow-hidden">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Portrait"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-charcoal/30">
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {/* Decorative Badge */}
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-charcoal text-cream flex items-center justify-center rounded-full text-[8px] font-medium uppercase tracking-wide text-center leading-tight">
                            Since<br />2020
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

AboutPreview.displayName = 'AboutPreview';
