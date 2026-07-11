import { create } from 'zustand';
import { ChecklistItem } from '../types/checklist';
import { loadJSON, saveJSON } from '../storage/storage';
import { registerTripCleanup } from '../storage/cleanup';
import { packingTemplates } from '../constants/packing';
import { makeId } from '../utils/id';

const KEY = 'to:checklist';

type State = {
  items: ChecklistItem[];
  filter: 'all' | 'done' | 'todo';
  load: () => Promise<void>;
  setFilter: (f: State['filter']) => void;
  itemsOf: (tripId: string) => ChecklistItem[];
  allItemsOf: (tripId: string) => ChecklistItem[];
  add: (tripId: string, label: string, group: string) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  generatePacking: (tripId: string, type: string) => Promise<number>;
};

export const useChecklistStore = create<State>((set, get) => ({
  items: [],
  filter: 'all',

  load: async () => set({ items: await loadJSON<ChecklistItem[]>(KEY, []) }),

  setFilter: (f) => set({ filter: f }),

  itemsOf: (tripId) => {
    const { items, filter } = get();
    return items.filter((i) => i.tripId === tripId && (filter === 'all' || (filter === 'done') === i.done));
  },

  allItemsOf: (tripId) => get().items.filter((i) => i.tripId === tripId),

  add: async (tripId, label, group) => {
    if (!label.trim()) return;
    const n = [...get().items, { id: makeId(), tripId, label: label.trim(), group, done: false }];
    set({ items: n });
    await saveJSON(KEY, n);
  },

  toggle: async (id) => {
    const n = get().items.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    set({ items: n });
    await saveJSON(KEY, n);
  },

  remove: async (id) => {
    const n = get().items.filter((i) => i.id !== id);
    set({ items: n });
    await saveJSON(KEY, n);
  },

  generatePacking: async (tripId, type) => {
    const merged: Record<string, string[]> = {};
    for (const block of [packingTemplates.base, packingTemplates[type] ?? {}]) {
      for (const [g, arr] of Object.entries(block)) merged[g] = [...(merged[g] ?? []), ...arr];
    }
    const existing = new Set(get().items.filter((i) => i.tripId === tripId).map((i) => i.label.toLowerCase()));
    const toAdd: ChecklistItem[] = [];
    for (const [group, arr] of Object.entries(merged))
      for (const label of arr)
        if (!existing.has(label.toLowerCase())) {
          toAdd.push({ id: makeId(), tripId, label, group, done: false });
          existing.add(label.toLowerCase());
        }
    if (toAdd.length) {
      const n = [...get().items, ...toAdd];
      set({ items: n });
      await saveJSON(KEY, n);
    }
    return toAdd.length;
  },
}));

registerTripCleanup(async (tripId) => {
  const n = useChecklistStore.getState().items.filter((i) => i.tripId !== tripId);
  useChecklistStore.setState({ items: n });
  await saveJSON(KEY, n);
});