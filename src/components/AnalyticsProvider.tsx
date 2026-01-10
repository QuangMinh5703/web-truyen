'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Schedule the analytics data to be consolidated once every 24 hours.
    analytics.startPeriodicExport(24);
  }, []);

  return <>{children}</>;
}
