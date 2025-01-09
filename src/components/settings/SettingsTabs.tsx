import React from 'react';

export const settingsTabs = [
  { label: 'Account', value: 'account' },
  { label: 'Appearance', value: 'appearance' },
  { label: 'Notifications', value: 'notifications' },
  { label: 'Privacy', value: 'privacy' },
  { label: 'Video & Chat', value: 'video-chat' },
  { label: 'Accessibility', value: 'accessibility' },
  { label: 'Advanced', value: 'advanced' },
] as const;

export type SettingsTab = typeof settingsTabs[number]['value'];