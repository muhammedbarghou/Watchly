import React from 'react';
import { FeatureItem } from './FeatureItem';

const features = [
  'Real-Time Video Sync',
  'Interactive Chat',
  'Responsive Design',
  'Customizable User Profiles',
];

export function AuthFeatures() {
  return (
    <div className="relative">
      <div className="w-full max-w-xl xl:w-full xl:mx-auto xl:pr-24 xl:max-w-xl">
        <h3 className="text-4xl font-bold text-white">
          Join our community & <br className="hidden xl:block" />
          Start your own theater
        </h3>
        <ul className="grid grid-cols-1 mt-10 sm:grid-cols-2 gap-x-8 gap-y-4">
          {features.map((feature) => (
            <FeatureItem key={feature} text={feature} />
          ))}
        </ul>
      </div>
    </div>
  );
}