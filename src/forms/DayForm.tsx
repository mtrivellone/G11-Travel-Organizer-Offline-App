import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Day } from '../types/itinerary';
import { useItineraryStore } from '../stores/itineraryStore';
import { theme } from '../theme/theme';
import { fmtDay } from '../utils/format';

type Props = { visible: boolean; onClose: () => void; day: Day | null };

export function DayForm({ visible, onClose, day }: Props) {
  const { updateDay } = useItineraryStore();
  const [title, setTitle] = useState(day?.title ?? '');
  const [place, setPlace] = useState(day?.place ?? '');

  React.useEffect(() => {
    setTitle(day?.title ?? '');
    setPlace(day?.place ?? '');
  }, [day?.id]);

  const save = async () => {
    if (!day) return;
    await updateDay({ ...day, title: title.trim(), place: place.trim() });
    onClose();
  };

  if (!day) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.bg} onPress={onClose} />
      <View style={s.sheet}>
        <Text style={s.h}>Modifica giornata · {fmtDay(day.date)}</Text>
        <TextInput style={s.in} placeholder="Titolo breve (es. Arrivo a Tokyo)" value={title} onChangeText={setTitle} />
        <TextInput style={s.in} placeholder="Località" value={place} onChangeText={setPlace} />
        <Pressable style={s.save} onPress={save}><Text style={s.saveTxt}>Salva</Text></Pressable>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0006' },
  sheet: { backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  h: { fontSize: 20, fontWeight: '700', color: theme.ink, marginBottom: 14 },
  in: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 10 },
  save: { backgroundColor: theme.primary, padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  saveTxt: { color: '#fff', fontWeight: '700' },
});