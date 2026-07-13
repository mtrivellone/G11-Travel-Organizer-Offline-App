import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useItineraryStore } from '../stores/itineraryStore';
import { useTripStore } from '../stores/tripStore';
import { ActivityCard } from '../components/ActivityCard';
import { theme } from '../theme/theme';

const MESI = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const labelDay = (iso: string) => { const d = new Date(iso); return `${d.getDate()} ${MESI[d.getMonth()]}`; };

export function TimelineScreen() {
  const { tripId } = useRoute<any>().params;
  const nav = useNavigation<any>();
  const itin = useItineraryStore();
  const trip = useTripStore((st) => st.getById(tripId));
  const insets = useSafeAreaInsets();

  useEffect(() => { itin.load(); }, []);
  const days = itin.daysOf(tripId);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ height: insets.top, backgroundColor: '#fff' }} />

      <Pressable style={[s.backBtn, { top: insets.top + 14 }]} onPress={() => nav.goBack()}>
        <Text style={s.backTxt}>‹</Text>
      </Pressable>

      <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={{ padding: 16, paddingTop: 64 }}>
        <Text style={s.title}>Timeline · {trip?.title ?? ''}</Text>
        {days.length === 0 && <Text style={s.empty}>Nessuna giornata pianificata</Text>}
        {days.map((day, idx) => {
          const acts = itin.activitiesOf(day.id);
          return (
            <View key={day.id} style={s.dayBlock}>
              <View style={s.rail}>
                <View style={s.dot} />
                {idx < days.length - 1 && <View style={s.line} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.dayTitle}>{labelDay(day.date)} · {day.place}</Text>
                {day.title ? <Text style={s.daySub}>{day.title}</Text> : null}
                <View style={{ marginTop: 8 }}>
                  {acts.length === 0 ? <Text style={s.none}>Nessuna attività</Text> :
                    acts.map((a) => <ActivityCard key={a.id} activity={a} />)}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  backBtn: {
    position: 'absolute', left: 16, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  backTxt: { fontSize: 20, color: theme.ink, marginTop: -2 },
  title: { fontSize: 22, fontWeight: '800', color: theme.ink, marginBottom: 16 },
  dayBlock: { flexDirection: 'row', gap: 14 },
  rail: { alignItems: 'center', width: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.primary, marginTop: 4 },
  line: { flex: 1, width: 2, backgroundColor: theme.border, marginVertical: 4 },
  dayTitle: { fontWeight: '700', color: theme.ink, fontSize: 15 },
  daySub: { color: theme.muted, fontSize: 13 },
  none: { color: theme.muted, fontSize: 13 },
  empty: { color: theme.muted, textAlign: 'center', marginTop: 30 },
});