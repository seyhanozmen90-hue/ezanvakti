export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FetchTimingsParams {
  coords: Coordinates;
  date: string; // YYYY-MM-DD
  timezone?: string;
}

export interface ProviderTimings {
  fajr: string; // HH:MM
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface ProviderResponse {
  timings: ProviderTimings;
  date: string;
  timezone: string;
}

export interface PrayerTimesProvider {
  /**
   * Fetch prayer timings from the provider
   * @throws Error if provider fails or times out
   */
  fetchTimings(params: FetchTimingsParams): Promise<ProviderResponse>;
  
  /**
   * Provider name for logging
   */
  readonly name: string;
}
