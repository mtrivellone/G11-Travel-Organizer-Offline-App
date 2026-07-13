import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { useNoteStore } from '../stores/noteStore';
import { useTripStore } from '../stores/tripStore';
import { useItineraryStore } from '../stores/itineraryStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useChecklistStore } from '../stores/checklistStore';
import { categories } from '../constants/categories';
import { fmtEuro } from '../utils/format';
import { theme } from '../theme/theme';

export function StatsScreen() {
  const noteStore = useNoteStore();
  const tripStore = useTripStore();
  const itinStore = useItineraryStore();
  const expStore = useExpenseStore();
  const checkStore = useChecklistStore();
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        await Promise.all([
          noteStore.load(),
          tripStore.load(),
          itinStore.load(),
          expStore.load(),
          checkStore.load(),
        ]);
        if (active) setReady(true);
      })();
      return () => { active = false; };
    }, [])
  );

  if (!ready) return <View style={s.center}><Text>Caricamento…</Text></View>;

  const trips = tripStore.trips;
  const expenses = expStore.expenses;

  const completedTrips = trips.filter((t) => t.status === 'completed');
  const completedTripIds = new Set(completedTrips.map((t) => t.id));
  const isTripPast = (tripId: string) => completedTripIds.has(tripId);

  const dayTripMap = new Map(itinStore.days.map((d) => [d.id, d.tripId]));

  const activeTrips = trips.filter((t) => t.status !== 'completed');
  const activeTripIds = new Set(activeTrips.map((t) => t.id));
  const totalBudget = activeTrips.reduce((sum, t) => sum + t.budget, 0);

  const tot = trips.length;
  const upcoming = trips.filter((t) => t.status === 'upcoming').length;
  const ongoing = trips.filter((t) => t.status === 'ongoing').length;
  const completed = completedTrips.length;

  const activeExpenses = expenses.filter((e) => !isTripPast(e.tripId));
  const paid = activeExpenses.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const plannedExpenses = activeExpenses.filter((e) => e.status === 'planned').reduce((sum, e) => sum + e.amount, 0);
  const plannedActivities = itinStore.activities
    .filter((a) => a.status !== 'cancelled' && activeTripIds.has(dayTripMap.get(a.dayId) ?? ''))
    .reduce((sum, a) => sum + (a.cost || 0), 0);
  const planned = plannedExpenses + plannedActivities;

  const delta = totalBudget - paid;

  const pastExpenses = expenses.filter((e) => isTripPast(e.tripId));
  const paidPast = pastExpenses.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const plannedExpensesPast = pastExpenses.filter((e) => e.status === 'planned').reduce((sum, e) => sum + e.amount, 0);
  const plannedActivitiesPast = itinStore.activities
    .filter((a) => a.status !== 'cancelled' && completedTripIds.has(dayTripMap.get(a.dayId) ?? ''))
    .reduce((sum, a) => sum + (a.cost || 0), 0);
  const plannedPast = plannedExpensesPast + plannedActivitiesPast;

  const byCat: Record<string, number> = {};
  for (const e of activeExpenses) byCat[e.category] = (byCat[e.category] ?? 0) + e.amount;
  const barData = Object.entries(byCat).map(([k, v]) => ({
    value: v,
    frontColor: categories[k]?.color ?? theme.muted,
    label: categories[k]?.label?.slice(0, 5) ?? k,
  }));

  const checkItems = checkStore.items;
  const checkDone = checkItems.filter((i) => i.done).length;
  const checkPct = checkItems.length ? Math.round((checkDone / checkItems.length) * 100) : 0;

  const topTrips = trips
    .map((t) => {
      const dayIds = itinStore.days.filter((d) => d.tripId === t.id).map((d) => d.id);
      const acts = itinStore.activities.filter((a) => dayIds.includes(a.dayId));
      const doneCount = acts.filter((a) => a.status === 'done').length;
      return { id: t.id, title: t.title, activityCount: acts.length, doneCount };
    })
    .sort((a, b) => b.activityCount - a.activityCount)
    .slice(0, 3);

  const allNotes = noteStore.notes;

  const pieData = [
    { value: upcoming, color: theme.warning },
    { value: ongoing, color: theme.primary },
    { value: completed, color: theme.muted },
  ].filter((d) => d.value > 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ height: insets.top, backgroundColor: '#fff' }} />

      <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }}>
        <Text style={s.title}>Statistiche</Text>

        <View style={s.grid}>
          <Badge value={String(tot)} label="Viaggi totali" />
          <Badge value={String(upcoming)} label="In programma" />
          <Badge value={String(ongoing)} label="In corso" />
          <Badge value={String(completed)} label="Completati" />
        </View>

        {pieData.length > 0 && (
          <View style={s.pieWrap}>
            <PieChart data={pieData} donut radius={70} innerRadius={45} />
            <View style={s.legend}>
              <LegendRow color={theme.warning} label="In programma" value={upcoming} />
              <LegendRow color={theme.primary} label="In corso" value={ongoing} />
              <LegendRow color={theme.muted} label="Completati" value={completed} />
            </View>
          </View>
        )}

        <View style={s.summary}>
          <Text style={s.big}>Speso {fmtEuro(paid)}</Text>
          <Text style={s.small}>Previsto {fmtEuro(planned)}</Text>
          <Text style={[s.small, delta < 0 && { color: '#F2B8A8' }]}>
            Budget {fmtEuro(totalBudget)} · {delta >= 0 ? 'rimanenti' : 'sforato di'} {fmtEuro(Math.abs(delta))}
          </Text>
          <Text style={s.small}>Note salvate: {allNotes.length}</Text>
        </View>

        {checkItems.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={s.section}>Checklist</Text>
            <Text style={s.progressLabel}>{checkDone}/{checkItems.length} completate ({checkPct}%)</Text>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${checkPct}%` }]} />
            </View>
          </View>
        )}

        {barData.length > 0 && (<>
          <Text style={s.section}>Spese per categoria</Text>
          <BarChart data={barData} barWidth={26} spacing={18} hideRules yAxisThickness={0} xAxisThickness={0} />
        </>)}

        <Text style={s.section}>Viaggi con più attività</Text>
        {topTrips.map((t) => (
          <View key={t.id} style={s.line}>
            <Text style={{ color: theme.ink }}>{t.title}</Text>
            <Text style={{ color: theme.muted }}>{t.doneCount}/{t.activityCount} completate</Text>
          </View>
        ))}

        {completedTrips.length > 0 && (
          <View style={s.summaryPast}>
            <Text style={s.pastLabel}>VIAGGI COMPLETATI</Text>
            <Text style={s.big}>Speso {fmtEuro(paidPast)}</Text>
            <Text style={s.small}>Previsto {fmtEuro(plannedPast)}</Text>
            <Text style={s.small}>Viaggi conclusi: {completedTrips.length}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Badge({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.badge}>
      <Text style={s.badgeVal}>{value}</Text>
      <Text style={s.badgeLbl}>{label}</Text>
    </View>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={s.legendRow}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={s.legendTxt}>{label}: {value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: theme.ink, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  badge: { width: '47%', backgroundColor: theme.card, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 16 },
  badgeVal: { fontSize: 24, fontWeight: '800', color: theme.ink },
  badgeLbl: { fontSize: 12, color: theme.muted, marginTop: 2 },
  pieWrap: { flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16, marginBottom: 16 },
  legend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendTxt: { color: theme.ink, fontSize: 13 },
  summary: { backgroundColor: theme.ink, borderRadius: 16, padding: 16, marginBottom: 4 },
  summaryPast: { backgroundColor: '#5C4B3A', borderRadius: 16, padding: 16, marginTop: 20 },
  pastLabel: { color: '#E8DFD2', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  big: { color: '#fff', fontSize: 18, fontWeight: '800' },
  small: { color: '#fff9', marginTop: 2 },
  section: { fontWeight: '700', color: theme.ink, marginTop: 20, marginBottom: 8 },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.border, backgroundColor: 'transparent' },
  progressLabel: { fontSize: 12, color: theme.muted, marginBottom: 6 },
  progressTrack: { height: 8, backgroundColor: '#EAE3D7', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.primary, borderRadius: 6 },
});