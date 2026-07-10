import { create } from 'zustand';
import { Day, Activity } from '../types/itinerary';
import { loadJSON, saveJSON } from '../storage/storage';
import { registerTripCleanup } from '../storage/cleanup';
import { makeId } from '../utils/id';

const DAYS = 'to:days';
const ACTS = 'to:activities';

const seedDays: Day[] = [
  { id: 't1d1', tripId: 't1', title: 'Arrivo a Tokyo', date: '2025-11-05', place: 'Tokyo', order: 1, notes: '' },
];
const seedActs: Activity[] = [
  { id: 'a1', dayId: 't1d1', title: 'Atterraggio a Narita', time: '14:30', place: 'Narita', category: 'trasporti', cost: 0, status: 'todo' },
  { id: 'a2', dayId: 't1d1', title: 'Check-in hotel', time: '17:00', place: 'Shinjuku', category: 'alloggio', cost: 0, status: 'todo' },
];

type State = {
  days: Day[]; activities: Activity[];
  load: () => Promise<void>;
  daysOf: (tripId: string) => Day[];
  activitiesOf: (dayId: string, category?: string) => Activity[];
  ensureDaysForTrip: (tripId: string, start: string, end: string) => Promise<void>;
  updateDay: (d: Day) => Promise<void>;
  addDay: (d: Day) => Promise<void>; deleteDay: (id: string) => Promise<void>;
  addActivity: (a: Activity) => Promise<void>; updateActivity: (a: Activity) => Promise<void>; deleteActivity: (id: string) => Promise<void>;
  cycleStatus: (id: string) => Promise<void>;
};

export const useItineraryStore = create<State>((set, get) => ({
  days: [], activities: [],
  load: async () => {
    let days = await loadJSON<Day[]>(DAYS, []);
    let activities = await loadJSON<Activity[]>(ACTS, []);
    if (days.length === 0 && activities.length === 0) {
      days = seedDays; activities = seedActs;
      await saveJSON(DAYS, days); await saveJSON(ACTS, activities);
    }
    set({ days, activities });
  },

  daysOf: (tripId) => get().days.filter((d) => d.tripId === tripId).sort((a, b) => a.order - b.order),
  activitiesOf: (dayId, category = 'all') =>
    get().activities.filter((a) => a.dayId === dayId && (category === 'all' || a.category === category))
      .sort((a, b) => a.time.localeCompare(b.time)),

  ensureDaysForTrip: async (tripId, start, end) => {
    const already = get().days.some((d) => d.tripId === tripId);
    if (already || !start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const generated: Day[] = [];
    let order = 1;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      generated.push({
        id: makeId(),
        tripId,
        title: '',
        date: d.toISOString(),
        place: '',
        order: order++,
        notes: '',
      });
    }
    if (generated.length === 0) return;
    const next = [...get().days, ...generated];
    set({ days: next });
    await saveJSON(DAYS, next);
  },

  addDay: async (d) => { const n = [...get().days, d]; set({ days: n }); await saveJSON(DAYS, n); },
  updateDay: async (d) => { const n = get().days.map((x) => x.id === d.id ? d : x); set({ days: n }); await saveJSON(DAYS, n); },
  deleteDay: async (id) => {
    const days = get().days.filter((d) => d.id !== id);
    const activities = get().activities.filter((a) => a.dayId !== id);
    set({ days, activities }); await saveJSON(DAYS, days); await saveJSON(ACTS, activities);
  },

  addActivity: async (a) => { const n = [...get().activities, a]; set({ activities: n }); await saveJSON(ACTS, n); },
  updateActivity: async (a) => { const n = get().activities.map((x) => x.id === a.id ? a : x); set({ activities: n }); await saveJSON(ACTS, n); },
  deleteActivity: async (id) => { const n = get().activities.filter((a) => a.id !== id); set({ activities: n }); await saveJSON(ACTS, n); },

  cycleStatus: async (id) => {
    const next = { todo: 'done', done: 'cancelled', cancelled: 'todo' } as const;
    const n = get().activities.map((a) => a.id === id ? { ...a, status: next[a.status] } : a);
    set({ activities: n }); await saveJSON(ACTS, n);
  },
}));

registerTripCleanup(async (tripId) => {
  const st = useItineraryStore.getState();
  const dayIds = st.days.filter((d) => d.tripId === tripId).map((d) => d.id);
  const days = st.days.filter((d) => d.tripId !== tripId);
  const activities = st.activities.filter((a) => !dayIds.includes(a.dayId));
  useItineraryStore.setState({ days, activities });
  await saveJSON(DAYS, days); await saveJSON(ACTS, activities);
});