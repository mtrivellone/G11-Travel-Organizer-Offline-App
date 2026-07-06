export type CategoryMeta = { label: string; color: string };

export const categories: Record<string, CategoryMeta> = {
  cultura:   { label: 'Cultura',      color: '#5B7C8D' },
  cibo:      { label: 'Cibo',         color: '#C2693E' },
  trasporti: { label: 'Trasporti',    color: '#6E7B5B' },
  natura:    { label: 'Natura',       color: '#4F7A5E' },
  alloggio:  { label: 'Alloggio',     color: '#7C6E9E' },
  shopping:  { label: 'Shopping',     color: '#B08A3E' },
  evento:    { label: 'Evento',       color: '#A85C6B' },
  libero:    { label: 'Tempo libero', color: '#8A8175' },
};

export const statusLabels: Record<string, string> = {
  upcoming: 'In programma',
  ongoing: 'In corso',
  completed: 'Completato',
};

export const tripTypeLabels: Record<string, string> = {
  culturale: 'Culturale', citta: 'Città', roadtrip: 'Roadtrip',
  mare: 'Mare', montagna: 'Montagna', avventura: 'Avventura',
};