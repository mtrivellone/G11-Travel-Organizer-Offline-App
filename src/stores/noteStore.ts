import { create } from 'zustand';
import { TripNote } from '../types/note';
import { loadJSON, saveJSON } from '../storage/storage';
import { registerTripCleanup } from '../storage/cleanup';

const KEY = 'to:notes';

type State = {
  notes: TripNote[];
  load: () => Promise<void>;
  notesOf: (tripId: string) => TripNote[];
  add: (n: TripNote) => Promise<void>;
  update: (n: TripNote) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useNoteStore = create<State>((set, get) => ({
  notes: [],

  load: async () => {
    const data = await loadJSON<TripNote[]>(KEY, []);
    set({ notes: data });
  },

  notesOf: (tripId) => get().notes.filter((n) => n.tripId === tripId),

  add: async (n) => {
    const next = [...get().notes, n];
    set({ notes: next });
    await saveJSON(KEY, next);
  },

  update: async (n) => {
    const next = get().notes.map((x) => (x.id === n.id ? n : x));
    set({ notes: next });
    await saveJSON(KEY, next);
  },

  remove: async (id) => {
    const next = get().notes.filter((n) => n.id !== id);
    set({ notes: next });
    await saveJSON(KEY, next);
  },
}));

registerTripCleanup(async (tripId) => {
  const next = useNoteStore.getState().notes.filter((n) => n.tripId !== tripId);
  useNoteStore.setState({ notes: next });
  await saveJSON(KEY, next);
});
