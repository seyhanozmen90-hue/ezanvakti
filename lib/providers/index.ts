import { PrayerTimesProvider } from './types';
import { aladhanProvider } from './aladhan';
import { diyanetProvider } from './diyanet';

// Active provider configuration
// Change this to switch between providers
const ACTIVE_PROVIDER: 'aladhan' | 'diyanet' = 
  (process.env.PRAYER_TIMES_PROVIDER as 'aladhan' | 'diyanet') || 'aladhan';

/**
 * Get the active prayer times provider
 * 
 * To switch providers, set PRAYER_TIMES_PROVIDER env variable
 * or change ACTIVE_PROVIDER constant above
 */
export function getActiveProvider(): PrayerTimesProvider {
  switch (ACTIVE_PROVIDER) {
    case 'aladhan':
      return aladhanProvider;
    case 'diyanet':
      return diyanetProvider;
    default:
      return aladhanProvider;
  }
}

export * from './types';
export { aladhanProvider } from './aladhan';
export { diyanetProvider } from './diyanet';
