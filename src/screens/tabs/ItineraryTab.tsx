import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useItineraryStore } from '../../stores/itineraryStore';
import { useTripStore } from '../../stores/tripStore';
import { DayChip } from '../../components/DayChip';
import { ActivityCard } from '../../components/ActivityCard';
import { DayForm } from '../../forms/DayForm';
import { ActivityForm } from '../../forms/ActivityForm';
import { Activity, Day } from '../../types/itinerary';
import { theme } from '../../theme/theme';

export function ItineraryTab({ tripId }: { tripId: string }) {
  const store = useItineraryStore();
  const trip = useTripStore((st) => st.getById(tripId));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayForm, setDayForm] = useState<Day | null>(null);
  const [actForm, setActForm] = useState<{ open: boolean; existing?: Activity }>({ open: false });

  useEffect(() => {
    (async () => {
      await store.load();
      if (trip) await store.ensureDaysForTrip(tripId, trip.start, trip.end);
    })();
  }, [trip?.id]);

  const days = store.daysOf(tripId);
  useEffect(() => { if (!selectedDay && days.length) setSelectedDay(days[0].id); }, [days.length]);

  const activities = selectedDay ? store.activitiesOf(selectedDay) : [];
  const currentDay = days.find((d) => d.id === selectedDay) ?? null;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.dayRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {days.map((d) => (
            <DayChip
              key={d.id}
              day={d}
              selected={d.id === selectedDay}
              onPress={() => setSelectedDay(d.id)}
            />
          ))}
        </ScrollView>
      </View>

      {currentDay && (
        <View style={s.dayHeader}>
          <Text style={s.dayHeaderTxt}>
            {currentDay.title || 'Giornata'}{currentDay.place ? ` · ${currentDay.place}` : ''}
          </Text>
          <Pressable onPress={() => setDayForm(currentDay)}>
            <Text style={s.editLink}>Modifica</Text>
          </Pressable>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {activities.length === 0 ? <Text style={s.empty}>Nessuna attività per questo giorno</Text> :
          activities.map((a) => (
            <ActivityCard key={a.id} activity={a}
              onToggle={() => store.cycleStatus(a.id)}
              onPress={() => setActForm({ open: true, existing: a })}
              onDelete={() => store.deleteActivity(a.id)} />
          ))}
        {selectedDay && (
          <Pressable style={s.addAct} onPress={() => setActForm({ open: true })}>
            <Text style={{ color: theme.primary, fontWeight: '700' }}>＋ Aggiungi attività</Text>
          </Pressable>
        )}
      </ScrollView>

      <DayForm visible={!!dayForm} onClose={() => setDayForm(null)} day={dayForm} />
      {selectedDay && (
        <ActivityForm visible={actForm.open} onClose={() => setActForm({ open: false })} dayId={selectedDay} existing={actForm.existing} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  dayRow: { height: 76, flexShrink: 0, paddingVertical: 8 },
  dayHeader: { flexShrink: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 4 },
  dayHeaderTxt: { color: theme.ink, fontWeight: '700' },
  editLink: { color: theme.primary, fontSize: 12, fontWeight: '600' },
  empty: { color: theme.muted, textAlign: 'center', marginTop: 20 },
  addAct: { borderWidth: 1, borderColor: theme.primary, borderRadius: 14, padding: 12, alignItems: 'center', marginTop: 8 },
});