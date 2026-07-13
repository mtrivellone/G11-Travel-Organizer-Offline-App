import { create } from 'zustand';
import { Trip } from '../types/trip';
import { loadJSON, saveJSON } from '../storage/storage';
import { runTripCleanup } from '../storage/cleanup';
import { computeTripStatus } from '../utils/tripStatus';

const KEY = 'to:trips';
const SEEDED_KEY = 'to:trips:seeded';

const seed: Trip[] = [
  { id: 't1', title: "Giappone d'autunno", destination: 'Tokyo · Kyoto',
    start: '2025-11-05', end: '2025-11-14', status: 'upcoming', budget: 3200,
    type: 'culturale', participants: ['Tu', 'Marco'], cover: ['#2C5A52', '#9CB7A8'] },
  { id: 't2', title: 'Weekend a Lisbona', destination: 'Lisbona · Sintra',
    start: '2025-12-12', end: '2025-12-14', status: 'upcoming', budget: 600,
    type: 'citta', participants: ['Tu', 'Sara'], cover: ['#B5623A', '#E3C4A0'] },
];

type TripState = {
  trips: Trip[];
  search: string;
  statusFilter: 'all' | Trip['status'];
  load: () => Promise<void>;
  setSearch: (q: string) => void;
  setStatusFilter: (s: TripState['statusFilter']) => void;
  filtered: () => Trip[];
  getById: (id: string) => Trip | undefined;
  add: (t: Trip) => Promise<void>;
  update: (t: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
};

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  search: '',
  statusFilter: 'all',

  load: async () => {
    let data = await loadJSON<Trip[]>(KEY, []);
    const alreadySeeded = await loadJSON<boolean>(SEEDED_KEY, false);

    if (data.length === 0 && !alreadySeeded) {
      data = seed;
      await saveJSON(SEEDED_KEY, true); // da qui in poi, il seed non tornerà mai più
    }

    const updated = data.map((t) => ({ ...t, status: computeTripStatus(t.start, t.end) }));
    await saveJSON(KEY, updated);
    set({ trips: updated });
  },

  setSearch: (q) => set({ search: q }),
  setStatusFilter: (s) => set({ statusFilter: s }),

  filtered: () => {
    const { trips, search, statusFilter } = get();
    return trips.filter((t) => {
      const okStatus = statusFilter === 'all' || t.status === statusFilter;
      const okSearch = (t.title + ' ' + t.destination).toLowerCase().includes(search.toLowerCase());
      return okStatus && okSearch;
    });
  },

  getById: (id) => get().trips.find((t) => t.id === id),

  add: async (t) => {
    const withStatus = { ...t, status: computeTripStatus(t.start, t.end) };
    const next = [...get().trips, withStatus];
    set({ trips: next }); await saveJSON(KEY, next);
  },
  update: async (t) => {
    const withStatus = { ...t, status: computeTripStatus(t.start, t.end) };
    const next = get().trips.map((x) => (x.id === t.id ? withStatus : x));
    set({ trips: next }); await saveJSON(KEY, next);
  },
  deleteTrip: async (id) => {
    await runTripCleanup(id);                  // elimina giorni/attività/checklist/spese/note
    const next = get().trips.filter((t) => t.id !== id);
    set({ trips: next }); await saveJSON(KEY, next);
  },
}));