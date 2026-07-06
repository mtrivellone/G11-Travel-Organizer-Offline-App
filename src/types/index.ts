// Entità di competenza: P2

export interface Day {
  id: string;
  tripId: string;  // Chiave esterna verso l'entità Trip (di P1)
  title: string;
  date: string;    // Consigliato il formato ISO (es. "2026-07-15") per evitare crash
  place: string;
  order: number;   // Numerico per ordinare facilmente le giornate
  notes: string;
}

export interface Activity {
  id: string;
  dayId: string;   // Chiave esterna verso la tua entità Day
  title: string;
  time: string;    // Stringa (es. "10:30")
  place: string;
  category: string; // Deve combaciare con le chiavi in categories.ts (Fase 0.8)
  cost: number;
  status: string;  // Es. "upcoming", "ongoing", "completed"
}