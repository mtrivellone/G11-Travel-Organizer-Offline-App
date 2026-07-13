import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import { useChecklistStore } from '../../stores/checklistStore';
import { useTripStore } from '../../stores/tripStore';
import { tripTypeLabels } from '../../constants/categories';
import { theme } from '../../theme/theme';
import { ChecklistItem } from '../../types/checklist';

const GRUPPI_STANDARD = ['Documenti', 'Valigia', 'Elettronica', 'Extra'];

function ItemRow({ item, isLast, onToggle, onDelete }: {
  item: ChecklistItem; isLast: boolean; onToggle: () => void; onDelete: () => void;
}) {
  return (
    <Pressable style={[s.itemRow, !isLast && s.itemDivider]} onPress={onToggle}>
      <View style={[s.box, item.done && s.boxOn]}>
        {item.done && <Text style={s.boxCheck}>✓</Text>}
      </View>
      <Text style={[s.itemLabel, item.done && s.itemDone]}>{item.label}</Text>
      <Pressable onPress={onDelete} hitSlop={10}>
        <Text style={s.del}>×</Text>
      </Pressable>
    </Pressable>
  );
}

function GroupCard({ group, items, tripId }: { group: string; items: ChecklistItem[]; tripId: string }) {
  const store = useChecklistStore();
  const [draft, setDraft] = useState('');

  const doneCount = items.filter((i) => i.done).length;

  const submit = () => {
    store.add(tripId, draft, group);
    setDraft('');
  };

  return (
    <View style={s.groupBlock}>
      <View style={s.groupHeader}>
        <Text style={s.groupName}>{group.toUpperCase()}</Text>
        {items.length > 0 && <Text style={s.groupCount}>{doneCount}/{items.length}</Text>}
      </View>
      <View style={s.card}>
        {items.map((i, idx) => (
          <ItemRow
            key={i.id}
            item={i}
            isLast={idx === items.length - 1}
            onToggle={() => store.toggle(i.id)}
            onDelete={() =>
            Alert.alert('Eliminare la voce?', i.label, [
                { text: 'Annulla', style: 'cancel' },
                { text: 'Elimina', style: 'destructive', onPress: () => store.remove(i.id) },
                    ])
              }
          />
        ))}
        <View style={s.addRow}>
          <TextInput
            style={s.addInput}
            placeholder="Aggiungi elemento…"
            placeholderTextColor={theme.muted}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
          />
          <Pressable style={s.addBtn} onPress={submit}>
            <Text style={s.addBtnTxt}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const FILTERS = [['all', 'Tutti'], ['todo', 'Da completare'], ['done', 'Completati']] as const;

export function ChecklistTab({ tripId }: { tripId: string }) {
  const store = useChecklistStore();
  const trip = useTripStore((st) => st.getById(tripId));
  const loadTrips = useTripStore((st) => st.load);

  useEffect(() => { store.load(); loadTrips(); }, []);

  const items = store.itemsOf(tripId);

  const all = store.allItemsOf(tripId);
  const doneCount = all.filter((i) => i.done).length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;

  const groups: Record<string, ChecklistItem[]> = {};
  if (store.filter === 'all') {
    for (const g of GRUPPI_STANDARD) groups[g] = [];
  }
  for (const i of items) (groups[i.group] ??= []).push(i);

  const typeLabel = tripTypeLabels[trip?.type ?? ''] ?? 'base';

  const onGenerate = async () => {
    const n = await store.generatePacking(tripId, trip?.type ?? 'base');
    Alert.alert(n > 0 ? `${n} elementi aggiunti` : 'Packing list già completa');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={s.header}>
        <Text style={s.title}>Checklist</Text>
        <Text style={s.progressLabel}>{doneCount}/{all.length}</Text>
      </View>
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${pct}%` }]} />
      </View>

      <Pressable style={s.gen} onPress={onGenerate}>
        <Text style={s.genTxt}>✦  Genera packing list per viaggio "{typeLabel}"</Text>
      </Pressable>

      <View style={s.filters}>
        {FILTERS.map(([v, label]) => (
          <Pressable key={v} onPress={() => store.setFilter(v)} style={[s.chip, store.filter === v && s.chipOn]}>
            <Text style={store.filter === v ? s.chipTxtOn : s.chipTxt}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {Object.keys(groups).length === 0 && (
        <Text style={s.empty}>Nessuna voce per questo filtro</Text>
      )}
      {Object.entries(groups).map(([group, list]) => (
        <GroupCard key={group} group={group} items={list} tripId={tripId} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '700', color: theme.ink, letterSpacing: -0.3 },
  progressLabel: { fontSize: 12, color: theme.muted },
  progressTrack: { height: 8, backgroundColor: '#EAE3D7', borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: theme.primary, borderRadius: 6 },
  gen: { borderWidth: 1, borderColor: theme.primary, backgroundColor: '#E7F0ED', borderRadius: 14, padding: 12, alignItems: 'center', marginTop: 14, marginBottom: 12 },
  genTxt: { color: theme.primary, fontWeight: '600', fontSize: 13.5 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: theme.border },
  chipOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  chipTxt: { color: theme.muted, fontSize: 12 },
  chipTxtOn: { color: '#fff', fontSize: 12 },
  groupBlock: { marginBottom: 18 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  groupName: { fontSize: 11, letterSpacing: 1, color: '#9A9082' },
  groupCount: { fontSize: 11, color: '#B6AC9C' },
  card: { backgroundColor: theme.card, borderWidth: 1, borderColor: '#EAE3D7', borderRadius: 16, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15 },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: '#F2EDE3' },
  box: { width: 21, height: 21, borderRadius: 7, borderWidth: 2, borderColor: '#D5CBB9', alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: theme.primary, borderColor: theme.primary },
  boxCheck: { color: '#fff', fontSize: 13, lineHeight: 15 },
  itemLabel: { flex: 1, fontSize: 15, color: theme.ink },
  itemDone: { color: theme.muted, textDecorationLine: 'line-through' },
  del: { color: '#C9BFAE', fontSize: 17 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 15 },
  addInput: { flex: 1, fontSize: 14, color: theme.ink, padding: 0 },
  addBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#F0EADF', alignItems: 'center', justifyContent: 'center' },
  addBtnTxt: { color: theme.primary, fontWeight: '700', fontSize: 18 },
  empty: { color: theme.muted, textAlign: 'center', marginTop: 20 },
});