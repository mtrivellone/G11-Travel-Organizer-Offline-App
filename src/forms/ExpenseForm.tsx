import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Expense } from '../types/expense';
import { useExpenseStore } from '../stores/expenseStore';
import { categories } from '../constants/categories';
import { makeId } from '../utils/id';
import { theme } from '../theme/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  tripId: string;
  existing?: Expense;
};

export function ExpenseForm({ visible, onClose, tripId, existing }: Props) {
  const { add, update } = useExpenseStore();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('cibo');
  const [status, setStatus] = useState<Expense['status']>('paid');

  // ogni volta che il form si apre, riparte dai dati giusti:
  // quelli della spesa da modificare, o vuoti per una nuova
  useEffect(() => {
    if (visible) {
      setTitle(existing?.title ?? '');
      setAmount(existing ? String(existing.amount) : '');
      setCategory(existing?.category ?? 'cibo');
      setStatus(existing?.status ?? 'paid');
    }
  }, [visible, existing]);

  const save = async () => {
    if (!title.trim()) return; // validazione minima
    const e: Expense = {
      id: existing?.id ?? makeId(),
      tripId,
      title: title.trim(),
      amount: Number(amount.replace(',', '.')) || 0,
      category,
      date: existing?.date ?? new Date().toISOString(),
      status,
    };
    existing ? await update(e) : await add(e);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.sheet}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={s.h}>{existing ? 'Modifica spesa' : 'Nuova spesa'}</Text>

          <TextInput style={s.in} placeholder="Descrizione" placeholderTextColor={theme.muted}
            value={title} onChangeText={setTitle} />
          <TextInput style={s.in} placeholder="Importo (€)" placeholderTextColor={theme.muted}
            keyboardType="numeric" value={amount} onChangeText={setAmount} />

          <Text style={s.label}>CATEGORIA</Text>
          <View style={s.chips}>
            {Object.entries(categories).map(([k, c]) => (
              <Pressable key={k} onPress={() => setCategory(k)}
                style={[s.chip, category === k && { backgroundColor: c.color, borderColor: c.color }]}>
                <Text style={category === k ? s.chipTxtOn : s.chipTxt}>{c.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.label}>TIPO</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {(['paid', 'planned'] as const).map((st) => (
              <Pressable key={st} onPress={() => setStatus(st)}
                style={[s.chip, { flex: 1, alignItems: 'center' }, status === st && s.chipDark]}>
                <Text style={status === st ? s.chipTxtOn : s.chipTxt}>
                  {st === 'paid' ? 'Effettiva' : 'Prevista'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={s.save} onPress={save}>
            <Text style={s.saveTxt}>Salva</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0006' },
  sheet: { backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  h: { fontSize: 20, fontWeight: '700', color: theme.ink, marginBottom: 14 },
  in: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 10, color: theme.ink },
  label: { fontSize: 11, letterSpacing: 1, color: '#9A9082', marginTop: 6, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
  chipDark: { backgroundColor: theme.ink, borderColor: theme.ink },
  chipTxt: { color: theme.muted, fontSize: 12 },
  chipTxtOn: { color: '#fff', fontSize: 12 },
  save: { backgroundColor: theme.primary, padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  saveTxt: { color: '#fff', fontWeight: '700' },
});