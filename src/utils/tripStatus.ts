import { TripStatus } from '../types/trip';

export function computeTripStatus(start: string, end: string): TripStatus {
  const today = new Date();
  const s = new Date(start);
  const e = new Date(end);

  today.setHours(0, 0, 0, 0);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  if (today < s) return 'upcoming';
  if (today > e) return 'completed';
  return 'ongoing';
}