import { TripStatus } from '../types/trip';

// Calcola lo stato del viaggio confrontando la data di oggi con partenza/ritorno.
// upcoming  → oggi è prima della partenza
// ongoing   → oggi è tra partenza e ritorno (inclusi)
// completed → oggi è dopo il ritorno
export function computeTripStatus(start: string, end: string): TripStatus {
  const today = new Date();
  const s = new Date(start);
  const e = new Date(end);

  // ignora l'orario, confronta solo le date
  today.setHours(0, 0, 0, 0);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  if (today < s) return 'upcoming';
  if (today > e) return 'completed';
  return 'ongoing';
}