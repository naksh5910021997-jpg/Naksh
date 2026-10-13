'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

// Records UTM / fbclid parameters from the landing URL. Renders nothing.
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
