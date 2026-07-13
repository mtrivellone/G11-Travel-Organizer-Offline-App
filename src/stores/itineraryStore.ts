import { create } from 'zustand';
import { Day, Activity } from '../types/itinerary';
import { loadJSON, saveJSON } from '../storage/storage';
import { registerTripCleanup } from '../storage/cleanup';
import { makeId } from '../utils/id'; // NUOVO

const DAYS = 'to:days';
const ACTS = 'to:activities';

// chiave "YYYY-MM-DD" in ora locale: serve per confrontare i giorni per data solare,
// ignorando eventuali differenze di orario/timestamp tra le stringhe ISO
const dateKey = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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
  syncDaysForTrip: (tripId: string, start: string, end: string) => Promise<void>; // sincronizza i giorni con l'intervallo attuale del viaggio
  updateDay: (d: Day) => Promise<void>; // (addDay/deleteDay restano nello store: servono a P5 per la duplicazione)
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

  // Sincronizza i giorni del viaggio con l'intervallo start–end attuale:
  // - i giorni la cui data rientra ancora nell'intervallo vengono mantenuti così come sono
  //   (stesso id, stesso titolo/note/attività: non si perde nulla di già compilato)
  // - le date mancanti vengono create
  // - i giorni la cui data non rientra più (viaggio accorciato) vengono rimossi insieme alle loro attività
  // A differenza della vecchia ensureDaysForTrip, questa funzione NON si ferma solo perché
  // esiste già un giorno: ricalcola sempre l'intero set rispetto all'intervallo corrente.
  syncDaysForTrip: async (tripId, start, end) => {
    if (!start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const targetKeys: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      targetKeys.push(dateKey(d.toISOString()));
    }
    if (targetKeys.length === 0) return;

    const existing = get().days.filter((d) => d.tripId === tripId);
    const existingByKey = new Map<string, Day>();
    for (const d of existing) {
      const key = dateKey(d.date);
      if (!existingByKey.has(key)) existingByKey.set(key, d); // ignora eventuali doppioni sulla stessa data
    }

    const nextForTrip: Day[] = targetKeys.map((key, i) => {
      const found = existingByKey.get(key);
      if (found) return { ...found, order: i + 1 };
      return { id: makeId(), tripId, title: '', date: key, place: '', order: i + 1, notes: '' };
    });

    const keptIds = new Set(nextForTrip.map((d) => d.id));
    const removedIds = existing.filter((d) => !keptIds.has(d.id)).map((d) => d.id);

    // se non è cambiato nulla, evitiamo scritture inutili su storage
    const sameAsBefore = removedIds.length === 0 &&
      nextForTrip.every((d) => existingByKey.get(dateKey(d.date))?.id === d.id) &&
      nextForTrip.length === existing.length;
    if (sameAsBefore) return;

    const otherDays = get().days.filter((d) => d.tripId !== tripId);
    const nextDays = [...otherDays, ...nextForTrip];
    const nextActivities = removedIds.length
      ? get().activities.filter((a) => !removedIds.includes(a.dayId))
      : get().activities;

    set({ days: nextDays, activities: nextActivities });
    await saveJSON(DAYS, nextDays);
    if (removedIds.length) await saveJSON(ACTS, nextActivities);
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