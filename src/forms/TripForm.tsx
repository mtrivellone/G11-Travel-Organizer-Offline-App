import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Trip } from '../types/trip';
import { useTripStore } from '../stores/tripStore';
import { makeId } from '../utils/id';
import { fmtDay } from '../utils/format';
import { coverForDestination } from '../utils/cover';
import { theme } from '../theme/theme';
import { tripTypeLabels } from '../constants/categories';

type Props = { visible: boolean; onClose: () => void; existing?: Trip };

export function TripForm({ visible, onClose, existing }: Props) {
  const { add, update } = useTripStore();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [type, setType] = useState('citta');
  const [participants, setParticipants] = useState('Tu');
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  // Ogni volta che il modulo si apre, riparte pulito (nuovo viaggio)
  // oppure precompilato coi dati giusti (modifica viaggio esistente).
  useEffect(() => {
    if (visible) {
      setTitle(existing?.title ?? '');
      setDestination(existing?.destination ?? '');
      setBudget(existing ? String(existing.budget) : '');
      setType(existing?.type ?? 'citta');
      setParticipants(existing?.participants?.join(', ') ?? 'Tu');
      setStart(existing?.start ? new Date(existing.start) : null);
      setEnd(existing?.end ? new Date(existing.end) : null);
    }
  }, [visible]);

  const save = async () => {
    if (!title.trim() || !start || !end) return;
    const trip: Trip = {
      id: existing?.id ?? makeId(),
      title: title.trim(),
      destination: destination.trim() || 'Da definire',
      start: start.toISOString(),
      end: end.toISOString(),
      status: existing?.status ?? 'upcoming',
      budget: Number(budget) || 0,
      type,
      participants: participants.split(',').map((p) => p.trim()).filter(Boolean),
      cover: coverForDestination(destination.trim() || 'Da definire'),
    };
    existing ? await update(trip) : await add(trip);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.sheet}>
        <ScrollView>
          <Text style={s.h}>{existing ? 'Modifica viaggio' : 'Nuovo viaggio'}</Text>
          <TextInput style={s.in} placeholder="Titolo" value={title} onChangeText={setTitle} />
          <TextInput style={s.in} placeholder="Destinazione" value={destination} onChangeText={setDestination} />

          <View style={s.row}>
            <Pressable style={[s.in, s.half]} onPress={() => setShowStart(true)}>
              <Text style={{ color: start ? theme.ink : theme.muted }}>
                {start ? fmtDay(start.toISOString()) : 'Partenza'}
              </Text>
            </Pressable>
            <Pressable style={[s.in, s.half]} onPress={() => setShowEnd(true)}>
              <Text style={{ color: end ? theme.ink : theme.muted }}>
                {end ? fmtDay(end.toISOString()) : 'Ritorno'}
              </Text>
            </Pressable>
          </View>

          {showStart && (
            <DateTimePicker
              value={start ?? new Date()}
              mode="date"
              display="default"
              maximumDate={end ?? undefined}
              onChange={(_, selected) => {
                setShowStart(false);
                if (selected) {
                  setStart(selected);
                  if (end && selected > end) setEnd(selected);
                }
              }}
            />
          )}
          {showEnd && (
            <DateTimePicker
              value={end ?? start ?? new Date()}
              mode="date"
              display="default"
              minimumDate={start ?? undefined}
              onChange={(_, selected) => { setShowEnd(false); if (selected) setEnd(selected); }}
            />
          )}

          <TextInput style={s.in} placeholder="Budget previsto (€)" keyboardType="numeric" value={budget} onChangeText={setBudget} />
          <TextInput style={s.in} placeholder="Partecipanti" value={participants} onChangeText={setParticipants} />

          <View style={s.chips}>
            {Object.entries(tripTypeLabels).map(([k, label]) => (
              <Pressable key={k} onPress={() => setType(k)} style={[s.chip, type === k && s.chipOn]}>
                <Text style={type === k ? s.chipTxtOn : s.chipTxt}>{label}</Text>
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
  backdrop: { flex: 1, backgroundColor: '#0006' },
  sheet: { backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  h: { fontSize: 20, fontWeight: '700', color: theme.ink, marginBottom: 14 },
  in: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
  chipOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  chipTxt: { color: theme.muted }, chipTxtOn: { color: '#fff' },
  save: { backgroundColor: theme.primary, padding: 14, borderRadius: 14, alignItems: 'center' },
  saveTxt: { color: '#fff', fontWeight: '700' },
});