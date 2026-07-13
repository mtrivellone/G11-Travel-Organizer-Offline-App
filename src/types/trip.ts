<<<<<<< HEAD
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
=======
export type TripStatus = 'upcoming' | 'ongoing' | 'completed';

export type Trip = {
  id: string;
  title: string;
  destination: string;
  start: string;   // ISO date
  end: string;     // ISO date
  status: TripStatus;
  budget: number;
  type: string;    // chiave di tripTypeLabels
  participants: string[];
  cover: [string, string]; // 2 colori hex per il gradiente
};
>>>>>>> feature/itinerario
