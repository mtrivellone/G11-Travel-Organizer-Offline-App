export type TripState = 'futuro' | 'in corso' | 'completato';

export interface Trip {
  id: string;
  titolo: string;
  destinazione: string;
  dataInizio: string;
  dataFine: string;
  descrizione: string;
  stato: TripState;
  budget: number;
}