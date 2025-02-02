import { Tv, MessageCircle, Users, Globe } from 'lucide-react';
import { InView } from '@/components/ui/in-view';


const features = [
  {
    icon: Tv,
    title: 'Watch Together',
    description: 'Synchronize your viewing experience with friends and family in real-time.'
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'React and chat with your viewing partners as the story unfolds.'
  },
  {
    icon: Users,
    title: 'Private Rooms',
    description: 'Create private viewing rooms and invite your friends to join.'
  },
  {
    icon: Globe,
    title: 'Watch Anywhere',
    description: 'Join from any device, anywhere in the world.'
  }
];

export function FeatureSection() {
  return (
    <InView
    variants={{
      hidden: { opacity: 0, y: 100, filter: 'blur(4px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    }}
    viewOptions={{ margin: '0px 0px -200px 0px' }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
    <div className="py-24 bg-netflix-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
          Why Choose Watchly?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="text-center p-6 rounded-lg bg-netflix-gray/50 backdrop-blur-sm"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-netflix-red mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </InView>
  );
}