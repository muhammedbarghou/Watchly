import { Rss } from 'lucide-react';
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';



export default function LandingBanner ()  {
    return (
        <div className="">
            <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-start justify-between text-white md:px-8">
                <div className="flex gap-x-4">
                    <div className="w-10 h-10 flex-none rounded-lg  flex items-center justify-center">
                        <Rss/>
                    </div>
                    <TextShimmerWave
                    className='py-2 font-medium'
                    duration={1}
                    spread={1}
                    zDistance={1}
                    scaleDistance={1.1}
                    rotateYDistance={20}>
                        this is not the official veriosn  
                        </TextShimmerWave>
                        </div>

            </div>
        </div>
    )
}