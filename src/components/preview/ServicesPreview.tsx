import { memo } from 'react';

interface Service {
    id?: string;
    title: string;
    description: string;
    icon: string;
}

interface ServicesPreviewProps {
    services: Service[];
    selectedId?: string;
    onSelect?: (id: string) => void;
}

export const ServicesPreview = memo(({ services, selectedId, onSelect }: ServicesPreviewProps) => {
    return (
        <div className="relative w-full h-full bg-cream overflow-auto">
            <div className="p-8 md:p-12">
                {/* Section Header */}
                <div className="flex items-baseline gap-4 mb-8">
                    <h2 className="text-3xl font-serif font-medium text-charcoal">Services</h2>
                    <span className="text-charcoal/40 text-sm">
                        ({services.length.toString().padStart(2, '0')})
                    </span>
                </div>

                {/* Services Grid */}
                {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => (
                            <div
                                key={service.id || service.title}
                                onClick={() => service.id && onSelect?.(service.id)}
                                className={`p-6 rounded-xl cursor-pointer transition-all duration-200 ${selectedId === service.id
                                        ? 'bg-white ring-2 ring-olive'
                                        : 'bg-white/50 hover:bg-white hover:shadow-md'
                                    }`}
                            >
                                <span className="text-3xl mb-4 block">{service.icon || '⚡'}</span>
                                <h3 className="font-serif text-lg mb-2 text-charcoal">{service.title}</h3>
                                <p className="text-sm text-charcoal/60 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-charcoal/10 rounded-xl">
                        <p className="text-charcoal/40">No services added yet</p>
                    </div>
                )}
            </div>
        </div>
    );
});

ServicesPreview.displayName = 'ServicesPreview';
