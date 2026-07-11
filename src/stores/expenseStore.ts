import { create } from 'zustand';
import { Expense } from '../types/expense';
import { loadJSON, saveJSON } from '../storage/storage';
import { registerTripCleanup } from '../storage/cleanup';

const KEY = 'to:expenses';

type State = {
  expenses: Expense[];
  catFilter: string;
  load: () => Promise<void>;
  setCatFilter: (c: string) => void;
  expensesOf: (tripId: string) => Expense[];
  allExpensesOf: (tripId: string) => Expense[];
  totals: (tripId: string) => { paid: number; planned: number };
  byCategory: (tripId: string) => Record<string, number>;
  add: (e: Expense) => Promise<void>;
  update: (e: Expense) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useExpenseStore = create<State>((set, get) => ({
  expenses: [],
  catFilter: 'all',

  load: async () => set({ expenses: await loadJSON<Expense[]>(KEY, []) }),

  setCatFilter: (c) => set({ catFilter: c }),

  expensesOf: (tripId) => {
    const { expenses, catFilter } = get();
    return expenses.filter((e) => e.tripId === tripId && (catFilter === 'all' || e.category === catFilter));
  },

  allExpensesOf: (tripId) => get().expenses.filter((e) => e.tripId === tripId),

  totals: (tripId) => {
    const list = get().expenses.filter((e) => e.tripId === tripId);
    return {
      paid: list.filter((e) => e.status === 'paid').reduce((s, e) => s + e.amount, 0),
      planned: list.filter((e) => e.status === 'planned').reduce((s, e) => s + e.amount, 0),
    };
  },

  byCategory: (tripId) => {
    const r: Record<string, number> = {};
    for (const e of get().expenses.filter((x) => x.tripId === tripId)) {
      r[e.category] = (r[e.category] ?? 0) + e.amount;
    }
    return r;
  },

  add: async (e) => {
    const n = [...get().expenses, e];
    set({ expenses: n });
    await saveJSON(KEY, n);
  },

  update: async (e) => {
    const n = get().expenses.map((x) => (x.id === e.id ? e : x));
    set({ expenses: n });
    await saveJSON(KEY, n);
  },

  remove: async (id) => {
    const n = get().expenses.filter((e) => e.id !== id);
    set({ expenses: n });
    await saveJSON(KEY, n);
  },
}));

registerTripCleanup(async (tripId) => {
  const n = useExpenseStore.getState().expenses.filter((e) => e.tripId !== tripId);
  useExpenseStore.setState({ expenses: n });
  await saveJSON(KEY, n);
});