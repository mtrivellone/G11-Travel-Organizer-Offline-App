import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { TripNote } from '../types/note';
import { useNoteStore } from '../stores/noteStore';
import { makeId } from '../utils/id';
import { theme } from '../theme/theme';

const TYPES = [['prenotazione', 'Prenotazione'], ['promemoria', 'Promemoria'], ['indirizzo', 'Indirizzo'], ['altro', 'Altro']];

type Props = { visible: boolean; onClose: () => void; tripId: string; existing?: TripNote };

export function NoteForm({ visible, onClose, tripId, existing }: Props) {
  const { add, update } = useNoteStore();
  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [type, setType] = useState(existing?.type ?? 'promemoria');

  // ogni volta che il form si apre, riparte dai dati giusti:
  // quelli della nota da modificare, o vuoti per una nuova
  useEffect(() => {
    if (visible) {
      setTitle(existing?.title ?? '');
      setContent(existing?.content ?? '');
      setType(existing?.type ?? 'promemoria');
    }
  }, [visible, existing]);

  const save = async () => {
    if (!title.trim()) return;
    const n: TripNote = { id: existing?.id ?? makeId(), tripId, title: title.trim(), content: content.trim(), type };
    existing ? await update(n) : await add(n);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.bg} onPress={onClose} />
      <View style={s.sheet}>
        <Text style={s.h}>{existing ? 'Modifica nota' : 'Nuova nota'}</Text>
        <TextInput style={s.in} placeholder="Titolo" value={title} onChangeText={setTitle} />
        <TextInput style={[s.in, { height: 100 }]} placeholder="Contenuto" multiline value={content} onChangeText={setContent} />
        <View style={s.chips}>
          {TYPES.map(([k, l]) => (
            <Pressable key={k} onPress={() => setType(k)} style={[s.chip, type === k && s.chipOn]}>
              <Text style={type === k ? { color: '#fff', fontSize: 12 } : { color: theme.muted, fontSize: 12 }}>{l}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={[s.save, !title.trim() && s.saveDisabled]} disabled={!title.trim()} onPress={save}>
          <Text style={s.saveTxt}>Salva</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0006' },
  sheet: { backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  h: { fontSize: 20, fontWeight: '700', color: theme.ink, marginBottom: 14 },
  in: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
  chipOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  save: { backgroundColor: theme.primary, padding: 14, borderRadius: 14, alignItems: 'center' },
  saveDisabled: { opacity: 0.5 },
  saveTxt: { color: '#fff', fontWeight: '700' },
});
