import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Activity } from '../types/itinerary';
import { useItineraryStore } from '../stores/itineraryStore';
import { categories } from '../constants/categories';
import { makeId } from '../utils/id';
import { theme } from '../theme/theme';

type Props = { visible: boolean; onClose: () => void; dayId: string; existing?: Activity };

export function ActivityForm({ visible, onClose, dayId, existing }: Props) {
  const { addActivity, updateActivity } = useItineraryStore();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('12:00');
  const [place, setPlace] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('cultura');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle(existing?.title ?? '');
    setTime(existing?.time ?? '12:00');
    setPlace(existing?.place ?? '');
    setCost(existing ? String(existing.cost) : '');
    setCategory(existing?.category ?? 'cultura');
  }, [visible, existing]);

  const [h, m] = time.split(':').map(Number);
  const timeAsDate = new Date(0, 0, 0, h, m);

  const onChangeTime = (_event: any, selected?: Date) => {
    setShowPicker(false);
    if (selected) {
      const hh = String(selected.getHours()).padStart(2, '0');
      const mm = String(selected.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${mm}`);
    }
  };

  const save = async () => {
    if (!title.trim()) return;
    const a: Activity = { id: existing?.id ?? makeId(), dayId, title: title.trim(), time, place: place.trim(), category, cost: Number(cost) || 0, status: existing?.status ?? 'todo' };
    existing ? await updateActivity(a) : await addActivity(a);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.bg} onPress={onClose} />
      <View style={s.sheet}>
        <ScrollView>
          <Text style={s.h}>{existing ? 'Modifica attività' : 'Nuova attività'}</Text>
          <TextInput style={s.in} placeholder="Titolo" value={title} onChangeText={setTitle} />

          <Pressable style={s.in} onPress={() => setShowPicker(true)}>
            <Text style={{ color: theme.ink }}>{time}</Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker value={timeAsDate} mode="time" is24Hour onChange={onChangeTime} />
          )}

          <TextInput style={s.in} placeholder="Luogo" value={place} onChangeText={setPlace} />
          <TextInput style={s.in} placeholder="Costo previsto (€)" keyboardType="numeric" value={cost} onChangeText={setCost} />
          <View style={s.chips}>
            {Object.entries(categories).map(([k, c]) => (
              <Pressable key={k} onPress={() => setCategory(k)} style={[s.chip, category === k && { backgroundColor: c.color, borderColor: c.color }]}>
                <Text style={category === k ? { color: '#fff', fontSize: 12 } : { color: theme.muted, fontSize: 12 }}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={s.save} onPress={save}><Text style={s.saveTxt}>Salva</Text></Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0006' },
  sheet: { backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  h: { fontSize: 20, fontWeight: '700', color: theme.ink, marginBottom: 14 },
  in: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
  save: { backgroundColor: theme.primary, padding: 14, borderRadius: 14, alignItems: 'center' },
  saveTxt: { color: '#fff', fontWeight: '700' },
});