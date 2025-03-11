import { Tv, MessageCircle, Users, Globe, PlusIcon, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FC } from 'react';

interface Feature {
  icon: FC;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  image: string;
}

const features: Feature[] = [
  {
    icon: Tv,
    title: 'Watch Together',
    subtitle: 'Real-time Synchronization',
    description: 'Synchronize your viewing experience with friends and family in real-time.',
    details: [
      'Start watching your favorite shows and movies together, perfectly synchronized across all devices.',
      'Create viewing parties with unlimited participants and enjoy shared controls for a truly collaborative experience.'
    ],
    image: 'https://images.pexels.com/photos/109669/pexels-photo-109669.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    subtitle: 'Interactive Discussion',
    description: 'React and chat with your viewing partners as the story unfolds.',
    details: [
      'Share your reactions in real-time with emoji reactions, text chat, and voice messages.',
      'Never miss a moment of discussion with our persistent chat history.'
    ],
    image: 'https://images.pexels.com/photos/8037019/pexels-photo-8037019.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    icon: Users,
    title: 'Private Rooms',
    subtitle: 'Exclusive Viewing',
    description: 'Create private viewing rooms and invite your friends to join.',
    details: [
      'Set up password-protected rooms for intimate viewing sessions.',
      'Customize your room settings, manage participants, and create recurring movie nights with saved preferences.'
    ],
    image: 'https://images.pexels.com/photos/7991491/pexels-photo-7991491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    icon: Globe,
    title: 'Watch Anywhere',
    subtitle: 'Universal Access',
    description: 'Join from any device, anywhere in the world.',
    details: [
      'Access your viewing parties from any device with a web browser.',
      'Our adaptive streaming ensures smooth playback regardless of your connection speed.'
    ],
    image: 'https://images.pexels.com/photos/8159242/pexels-photo-8159242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

export const FeatureSection: FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: '0px 0px -200px 0px', once: true }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="py-24 bg-netflix-black"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 text-center mb-16">
          Why Choose Watchly?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="flex flex-col overflow-hidden border dark:border-zinc-50/10 dark:bg-zinc-900 rounded-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative overflow-hidden cursor-pointer" onClick={() => setSelectedFeature(feature)}>
                <motion.img
                  src={feature.image}
                  alt={feature.description}
                  className="h-48 w-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="flex grow flex-row items-end justify-between px-3 py-2">
                  <div>
                    <h3 className="text-zinc-50">{feature.title}</h3>
                    <p className="text-zinc-400">{feature.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    className="relative ml-1 flex h-6 w-6 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500"
                    aria-label="Open dialog"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFeature(feature);
                    }}
                  >
                    <PlusIcon size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedFeature(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', bounce: 0.05, duration: 0.25 }}
              className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-50/10 bg-zinc-900 sm:w-[500px] rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute right-4 top-4 z-10 rounded-full bg-black/30 p-1 text-zinc-50 hover:bg-black/40"
                onClick={() => setSelectedFeature(null)}
              >
                <X size={20} />
              </button>
              
              <motion.img
                src={selectedFeature.image}
                alt={selectedFeature.description}
                className="h-full w-full"
              />
              
              <div className="p-6">
                <h2 className="text-2xl text-zinc-50">{selectedFeature.title}</h2>
                <p className="text-zinc-400">{selectedFeature.subtitle}</p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {selectedFeature.details.map((detail, index) => (
                    <p key={index} className="mt-2 text-zinc-500">
                      {detail}
                    </p>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}