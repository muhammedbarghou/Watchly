import React from 'react';
import { Check } from 'lucide-react';

export const FeatureItem = ({ text }) => (
  <li className="flex items-center space-x-3">
    <div className="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 bg-[#d00000] rounded-full">
      <Check className="w-3.5 h-3.5 text-white" />
    </div>
    <span className="text-lg font-medium text-white">{text}</span>
  </li>
);