import { Tv, MessageCircle, Users, Globe } from 'lucide-react';
import { InView } from '@/components/ui/in-view';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from '@/components/ui/morphing-dialog';
import { PlusIcon } from 'lucide-react';

const features = [
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
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 text-center mb-16">
            Why Choose Watchly?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <MorphingDialog
                key={feature.title}
                transition={{
                  type: 'spring',
                  bounce: 0.05,
                  duration: 0.25,
                }}
              >
                <MorphingDialogTrigger
                  style={{
                    borderRadius: '12px',
                  }}
                  className="flex max-w-[270px] flex-col overflow-hidden border dark:border-zinc-50/10 dark:bg-zinc-900"
                >
                  <MorphingDialogImage
                    src={feature.image}
                    alt={feature.description}
                    className="h-48 w-full object-cover"
                  />
                  <div className="flex grow flex-row items-end justify-between px-3 py-2">
                    <div>
                      <MorphingDialogTitle className="text-zinc-50">
                        {feature.title}
                      </MorphingDialogTitle>
                      <MorphingDialogSubtitle className="text-zinc-400">
                        {feature.subtitle}
                      </MorphingDialogSubtitle>
                    </div>
                    <button
                      type="button"
                      className="relative ml-1 flex h-6 w-6 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500"
                      aria-label="Open dialog"
                    >
                      <PlusIcon size={12} />
                    </button>
                  </div>
                </MorphingDialogTrigger>
                <MorphingDialogContainer>
                  <MorphingDialogContent
                    style={{
                      borderRadius: '24px',
                    }}
                    className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-50/10 bg-zinc-900 sm:w-[500px]"
                  >
                    <MorphingDialogImage
                      src={feature.image}
                      alt={feature.description}
                      className="h-full w-full"
                    />
                    <div className="p-6">
                      <MorphingDialogTitle className="text-2xl text-zinc-50">
                        {feature.title}
                      </MorphingDialogTitle>
                      <MorphingDialogSubtitle className="text-zinc-400">
                        {feature.subtitle}
                      </MorphingDialogSubtitle>
                      <MorphingDialogDescription
                        disableLayoutAnimation
                        variants={{
                          initial: { opacity: 0, scale: 0.8, y: 100 },
                          animate: { opacity: 1, scale: 1, y: 0 },
                          exit: { opacity: 0, scale: 0.8, y: 100 },
                        }}
                      >
                        {feature.details.map((detail, index) => (
                          <p key={index} className="mt-2 text-zinc-500">
                            {detail}
                          </p>
                        ))}
                      </MorphingDialogDescription>
                    </div>
                    <MorphingDialogClose className="text-zinc-50" />
                  </MorphingDialogContent>
                </MorphingDialogContainer>
              </MorphingDialog>
            ))}
          </div>
        </div>
      </div>
    </InView>
  );
}