export interface SolarSystem {
  id: string;
  name: string;
  capacitykWp: number; // e.g. 5.5 kWp
  location: string;
  installDate: string;
  panelBrand?: string;
  inverterModel?: string;
}

export interface CheckInRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  systemName: string;
  capacitykWp: number;
  dailyKWh: number;
  co2SavedKg: number;
  treesEquivalent: number;
  checkInDate: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm
  location: string;
  photoUrl?: string;
  note?: string;
  weather: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy';
  likesCount: number;
}

export interface CheckInFormData {
  systemName: string;
  capacitykWp: number;
  dailyKWh: number;
  location: string;
  photoUrl?: string;
  note?: string;
  weather: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy';
}
