import {
  PrayerTimesProvider,
  FetchTimingsParams,
  ProviderResponse,
} from './types';

/**
 * Diyanet provider stub
 * 
 * TODO: Implement actual Diyanet API integration
 * For now, this is a placeholder that throws NotImplementedError
 */
export class DiyanetProvider implements PrayerTimesProvider {
  readonly name = 'diyanet';

  async fetchTimings(params: FetchTimingsParams): Promise<ProviderResponse> {
    throw new Error(
      'Diyanet provider not yet implemented. Use Aladhan provider for now.'
    );
  }
}

// Singleton instance
export const diyanetProvider = new DiyanetProvider();
