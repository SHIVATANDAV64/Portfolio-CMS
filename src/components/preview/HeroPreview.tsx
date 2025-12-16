import { memo } from 'react';

interface HeroPreviewProps {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
}

// Memoized to prevent unnecessary re-renders
export const HeroPreview = memo(({
    title,
    subtitle,
    description,
    ctaText
}: HeroPreviewProps) => {
    // Split title into words for stacked effect
    const titleWords = title.split(' ').filter(Boolean);

    return (
        <div className="relative w-full h-full bg-cream overflow-auto">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-olive/5 to-transparent blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-terracotta/5 to-transparent blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center min-h-full p-8 md:p-12">
                {/* Stacked Title */}
                <div className="space-y-0 mb-8">
                    {titleWords.map((word, index) => (
                        <div
                            key={index}
                            className={index === 1 ? 'ml-[8%]' : ''}
                        >
                            <span
                                className={`block text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-charcoal leading-[0.95] ${index === 1 ? 'italic' : ''
                                    }`}
                            >
                                {word}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Description Card */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-6">
                    <div className="max-w-sm bg-white/40 backdrop-blur-sm p-5 rounded-2xl border border-white/30">
                        <p className="text-sm md:text-base font-light leading-relaxed text-charcoal/80">
                            {description || 'Your description here...'}
                        </p>
                        {ctaText && (
                            <div className="mt-4">
                                <span className="inline-flex items-center gap-2 px-5 py-2.5 border border-charcoal/20 bg-white/40 backdrop-blur-sm rounded-full text-xs uppercase tracking-widest font-medium">
                                    {ctaText}
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider px-5 py-3 rounded-full bg-white/40 backdrop-blur-sm border border-white/30">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                        <span>{subtitle || 'Based in India'}</span>
                        <span className="text-charcoal/30">/</span>
                        <span>Available for freelance</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

HeroPreview.displayName = 'HeroPreview';
