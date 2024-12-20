import React from 'react';
import { Shield,RefreshCw,Handshake,MessageCircle  } from 'lucide-react';
const Features = () => {        
return (
    <section className="py-10 bg-transparent sm:py-16 lg:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 text-center sm:grid-cols-2 gap-y-8 lg:grid-cols-4 sm:gap-12">
                <div>
                    <div className="flex items-center justify-center w-20 h-20 mx-auto bg-white rounded-full">
                        <Shield className='text-[#D00000] w-10 h-10'/>
                    </div>
                    <h3 class="mt-8 text-lg font-semibold text-white">Security and Privacy</h3>
                    <p class="mt-4 text-sm text-gray-300">Rest easy with secure account settings, two-factor authentication, and private room options.</p>
                </div>
                <div>
                    <div class="flex items-center justify-center w-20 h-20 mx-auto bg-white rounded-full">
                        <RefreshCw className='text-[#D00000] w-10 h-10'/>
                    </div>
                    <h3 class="mt-8 text-lg font-semibold text-white">Real-Time Video Sync</h3>
                    <p class="mt-4 text-sm text-gray-300">Watch videos in perfect sync with friends, with shared controls for a seamless viewing experience.</p>
                </div>
                <div>
                    <div class="flex items-center justify-center w-20 h-20 mx-auto bg-white rounded-full">
                        <Handshake  className='text-[#6A040F] w-10 h-10'/>
                    </div>
                    <h3 class="mt-8 text-lg font-semibold text-white">Advanced freinds mode</h3>
                    <p class="mt-4 text-sm text-gray-300">Engage in real-time chat and comments while watching, adding a social layer to every viewing session</p>
                </div>
                <div>
                    <div class="flex items-center justify-center w-20 h-20 mx-auto bg-red-100 rounded-full">
                        <MessageCircle className='text-[#6A040F] w-10 h-10' />
                    </div>
                    <h3 class="mt-8 text-lg font-semibold text-white">Interactive Chat</h3>
                    <p class="mt-4 text-sm text-gray-300">Engage in real-time chat and comments while watching, adding a social layer to every viewing session</p>
                </div>
            </div>
        </div>
    </section>
)
}
export default Features;
