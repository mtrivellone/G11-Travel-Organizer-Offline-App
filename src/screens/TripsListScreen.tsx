import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTripStore } from '../stores/tripStore';
import { TripCard } from '../components/TripCard';
import { TripForm } from '../forms/TripForm';
import { theme } from '../theme/theme';
import { Trip } from '../types/trip';

const FILTERS = [['all', 'Tutti'], ['upcoming', 'In programma'], ['ongoing', 'In corso'], ['completed', 'Completati']] as const;

export function TripsListScreen() {
  const nav = useNavigation<any>();
  const { load, setSearch, setStatusFilter, statusFilter, filtered } = useTripStore();
  const [form, setForm] = useState<{ open: boolean; existing?: Trip }>({ open: false });

  useEffect(() => { load(); }, []);
  const trips = filtered();

  return (
    <View style={s.wrap}>
      <TextInput style={s.search} placeholder="Cerca per titolo o destinazione…" onChangeText={setSearch} />
      <View style={s.filters}>
        {FILTERS.map(([v, label]) => (
          <Pressable key={v} onPress={() => setStatusFilter(v as any)} style={[s.chip, statusFilter === v && s.chipOn]}>
            <Text style={statusFilter === v ? s.chipTxtOn : s.chipTxt}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={trips}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            onPress={() => nav.navigate('TripDetail', { tripId: item.id })}
            onLongPress={() => setForm({ open: true, existing: item })}
          />
        )}
        ListEmptyComponent={<Text style={s.empty}>Nessun viaggio trovato</Text>}
        contentContainerStyle={{ paddingBottom: 90 }}
      />
      <Pressable style={s.fab} onPress={() => setForm({ open: true })}><Text style={s.fabTxt}>＋</Text></Pressable>
      <TripForm visible={form.open} onClose={() => setForm({ open: false })} existing={form.existing} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.background, padding: 16 },
  search: { backgroundColor: theme.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: theme.border },
  filters: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
  chipOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  chipTxt: { color: theme.muted, fontSize: 12 }, chipTxtOn: { color: '#fff', fontSize: 12 },
  empty: { textAlign: 'center', color: theme.muted, marginTop: 40 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  fabTxt: { color: '#fff', fontSize: 28, lineHeight: 30 },
});