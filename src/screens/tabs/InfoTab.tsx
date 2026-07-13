import React, { useEffect, useState } from 'react';
import { Text, ScrollView, Pressable, StyleSheet, View, Alert } from 'react-native';
import { useNoteStore } from '../../stores/noteStore';
import { useTripStore } from '../../stores/tripStore';
import { NoteForm } from '../../forms/NoteForm';
import { TripNote } from '../../types/note';
import { theme } from '../../theme/theme';
import { fmtEuro } from '../../utils/format';

const typeColors: Record<string, string> = {
  prenotazione: '#5B7C8D',
  promemoria: '#B08A3E',
  indirizzo: '#6E7B5B',
  altro: '#8A8175',
};

type Props = { tripId: string };

export function InfoTab({ tripId }: Props) {
  const store = useNoteStore();
  const trip = useTripStore((st) => st.getById(tripId)); // selettore diretto, sempre aggiornato
  const [form, setForm] = useState<{ open: boolean; existing?: TripNote }>({ open: false });

  useEffect(() => { store.load(); }, []);
  const notes = store.notesOf(tripId);

  const confirmRemove = (n: TripNote) => {
    Alert.alert('Eliminare la nota?', n.title, [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Elimina', style: 'destructive', onPress: () => store.remove(n.id) },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }}>
      {/* Riquadro info viaggio — con i dati veri del viaggio aperto */}
      {trip && (
        <View style={s.box}>
          <Text style={s.boxTitle}>{trip.title}</Text>
          <Text style={s.boxLine}>{trip.destination}</Text>
          <Text style={s.boxLine}>Partecipanti: {trip.participants.join(', ')}</Text>
          <Text style={s.boxLine}>Budget previsto: {fmtEuro(trip.budget)}</Text>
        </View>
      )}

      <Text style={s.h}>Note e informazioni utili</Text>
      {notes.length === 0 && <Text style={s.empty}>Nessuna nota aggiunta</Text>}

      {notes.map((n) => (
        <Pressable
          key={n.id}
          style={s.note}
          onPress={() => setForm({ open: true, existing: n })}
          onLongPress={() => confirmRemove(n)}
        >
          <View style={s.noteHeader}>
            <Text style={s.noteTitle}>{n.title}</Text>
            <View style={[s.badge, { backgroundColor: typeColors[n.type] ?? theme.muted }]}>
              <Text style={s.badgeTxt}>{n.type}</Text>
            </View>
          </View>
          <Text style={s.noteContent}>{n.content}</Text>
          <Text style={s.hint}>tocca per modificare · tieni premuto per eliminare</Text>
        </Pressable>
      ))}

      <Pressable style={s.add} onPress={() => setForm({ open: true })}>
        <Text style={{ color: theme.primary, fontWeight: '700' }}>＋ Aggiungi nota</Text>
      </Pressable>

      <NoteForm visible={form.open} onClose={() => setForm({ open: false })} tripId={tripId} existing={form.existing} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  box: { backgroundColor: theme.ink, borderRadius: 16, padding: 16, marginBottom: 18 },
  boxTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  boxLine: { color: '#fff9', marginTop: 4, fontSize: 13 },
  h: { fontWeight: '700', fontSize: 16, color: theme.ink, marginBottom: 8 },
  empty: { color: theme.muted, marginBottom: 8 },
  note: { backgroundColor: theme.card, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 10 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTitle: { fontWeight: '700', color: theme.ink, fontSize: 15, flex: 1 },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  noteContent: { color: theme.ink, marginTop: 6 },
  hint: { color: theme.muted, fontSize: 10, marginTop: 6 },
  add: { borderWidth: 1, borderColor: theme.primary, borderRadius: 14, padding: 12, alignItems: 'center', marginTop: 4 },
});
