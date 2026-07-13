import { useTripStore } from '../stores/tripStore';
import { useItineraryStore } from '../stores/itineraryStore';
import { useChecklistStore } from '../stores/checklistStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useNoteStore } from '../stores/noteStore';
import { makeId } from '../utils/id';
import { Trip } from '../types/trip';

export async function duplicateTrip(tripId: string): Promise<string> {
  const trips = useTripStore.getState();
  const itin = useItineraryStore.getState();
  const checklist = useChecklistStore.getState();
  const expenses = useExpenseStore.getState();
  const notes = useNoteStore.getState();

  const original = trips.getById(tripId);
  if (!original) return tripId;

  // 1) nuovo viaggio (stato azzerato a "upcoming")
  const newTripId = makeId();
  const newTrip: Trip = { ...original, id: newTripId, title: `${original.title} (copia)`, status: 'upcoming' };
  await trips.add(newTrip);

  // 2) giorni con mappa vecchio→nuovo id; 3) attività rimappate, stato azzerato
  const dayIdMap = new Map<string, string>();
  for (const d of itin.daysOf(tripId)) {
    const newDayId = makeId();
    dayIdMap.set(d.id, newDayId);
    await itin.addDay({ ...d, id: newDayId, tripId: newTripId });
  }
  for (const [oldDayId, newDayId] of dayIdMap) {
    for (const a of itin.activitiesOf(oldDayId)) {
      await itin.addActivity({ ...a, id: makeId(), dayId: newDayId, status: 'todo' });
    }
  }

  // 4) checklist (completamento azzerato)
  for (const i of checklist.itemsOf(tripId)) {
    await checklist.add(newTripId, i.label, i.group);
  }

  // 5) spese (azzerate a "planned")
  for (const e of expenses.expensesOf(tripId)) {
    await expenses.add({ ...e, id: makeId(), tripId: newTripId, status: 'planned' });
  }

  // 6) note (opzionale — decidere col gruppo se ha senso duplicarle)
  for (const n of notes.notesOf(tripId)) {
    await notes.add({ ...n, id: makeId(), tripId: newTripId });
  }

  await trips.load();
  return newTripId;
}