import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useExpenseStore } from '../../stores/expenseStore';
import { useTripStore } from '../../stores/tripStore';
import { ExpenseForm } from '../../forms/ExpenseForm';
import { Expense } from '../../types/expense';
import { categories } from '../../constants/categories';
import { fmtEuro, fmtDay } from '../../utils/format';
import { theme } from '../../theme/theme';

export function ExpensesTab({ tripId }: { tripId: string }) {
  const store = useExpenseStore();
  const trip = useTripStore((st) => st.getById(tripId));
  const loadTrips = useTripStore((st) => st.load);

  const [form, setForm] = useState<{ open: boolean; existing?: Expense }>({ open: false });

  useEffect(() => { store.load(); loadTrips(); }, []);

  const list = store.expensesOf(tripId);
  const { paid, planned } = store.totals(tripId);
  const byCat = store.byCategory(tripId);
  const budget = trip?.budget ?? 0;
  const residuo = budget - paid;

  // percentuali per la barra impilata (limitate per non sforare la barra)
  const paidPct = budget > 0 ? Math.min((paid / budget) * 100, 100) : 0;
  const plannedPct = budget > 0 ? Math.min((planned / budget) * 100, 100 - paidPct) : 0;

  // barre per categoria: larghezza relativa alla categoria più costosa
  const maxCat = Math.max(...Object.values(byCat), 1);
  const catBars = Object.entries(byCat).map(([k, v]) => ({
    key: k,
    label: categories[k]?.label ?? k,
    color: categories[k]?.color ?? theme.muted,
    amount: v,
    pct: (v / maxCat) * 100,
  }));

  const FILTERS: [string, string][] = [['all', 'Tutte'], ...Object.entries(categories).map(([k, c]) => [k, c.label] as [string, string])];

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {/* header */}
      <View style={s.header}>
        <Text style={s.title}>Spese</Text>
        <Text style={s.budgetLabel}>Budget {fmtEuro(budget)}</Text>
      </View>

      {/* card budget */}
      <View style={s.budgetCard}>
        <View style={s.budgetTop}>
          <View>
            <Text style={s.klein}>SPESA EFFETTIVA</Text>
            <Text style={s.big}>{fmtEuro(paid)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.klein}>{residuo < 0 ? 'SFORAMENTO' : 'RESIDUO'}</Text>
            <Text style={[s.remaining, { color: residuo < 0 ? '#FF8A80' : '#B9F6CA' }]}>
              {fmtEuro(Math.abs(residuo))}
            </Text>
          </View>
        </View>
        <View style={s.stackTrack}>
          <View style={[s.stackPaid, { width: `${paidPct}%` }]} />
          <View style={[s.stackPlanned, { width: `${plannedPct}%` }]} />
        </View>
        <View style={s.legend}>
          <Text style={s.legendTxt}>■ Effettiva {fmtEuro(paid)}</Text>
          <Text style={[s.legendTxt, { opacity: 0.6 }]}>■ Prevista {fmtEuro(planned)}</Text>
        </View>
      </View>

      {/* barre per categoria */}
      {catBars.length > 0 && (
        <>
          <Text style={s.section}>PER CATEGORIA</Text>
          <View style={{ gap: 12, marginBottom: 22 }}>
            {catBars.map((c) => (
              <View key={c.key}>
                <View style={s.catRow}>
                  <Text style={[s.catName, { color: c.color }]}>{c.label}</Text>
                  <Text style={s.catAmount}>{fmtEuro(c.amount)}</Text>
                </View>
                <View style={s.catTrack}>
                  <View style={[s.catFill, { width: `${c.pct}%`, backgroundColor: c.color }]} />
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* filtro categoria */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ gap: 6 }}>
        {FILTERS.map(([v, label]) => (
          <Pressable key={v} onPress={() => store.setCatFilter(v)} style={[s.chip, store.catFilter === v && s.chipOn]}>
            <Text style={store.catFilter === v ? s.chipTxtOn : s.chipTxt}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* movimenti */}
      <Text style={s.section}>MOVIMENTI</Text>
      {list.length === 0 && <Text style={s.empty}>Nessuna spesa {store.catFilter !== 'all' ? 'per questa categoria' : ''}</Text>}
      <View style={{ gap: 10 }}>
        {list.map((e) => {
          const cat = categories[e.category];
          return (
            <Pressable key={e.id} style={s.row} onPress={() => setForm({ open: true, existing: e })}>
              <View style={[s.catBadge, { backgroundColor: (cat?.color ?? theme.muted) + '22' }]}>
                <Text style={[s.catInitial, { color: cat?.color ?? theme.muted }]}>{(cat?.label ?? e.category)[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{e.title}</Text>
                <Text style={s.rowSub}>{cat?.label ?? e.category} · {fmtDay(e.date)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.rowAmount}>{fmtEuro(e.amount)}</Text>
                <Text style={[s.rowBadge, { color: e.status === 'paid' ? theme.primary : theme.warning }]}>
                  {e.status === 'paid' ? 'Effettiva' : 'Prevista'}
                </Text>
              </View>
              <Pressable
              onPress={() =>
                Alert.alert('Eliminare la spesa?', `${e.title} — ${fmtEuro(e.amount)}`, [
                  { text: 'Annulla', style: 'cancel' },
                  { text: 'Elimina', style: 'destructive', onPress: () => store.remove(e.id) },
                              ])
                        }
            hitSlop={10}
          >
                <Text style={s.del}>×</Text>
              </Pressable>
            </Pressable>
          );
        })}
      </View>

      {/* aggiungi */}
      <Pressable style={s.add} onPress={() => setForm({ open: true })}>
        <Text style={s.addTxt}>+  Aggiungi spesa</Text>
      </Pressable>

      {/* form modale (nuova spesa o modifica) */}
      <ExpenseForm
        visible={form.open}
        onClose={() => setForm({ open: false })}
        tripId={tripId}
        existing={form.existing}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '700', color: theme.ink, letterSpacing: -0.3 },
  budgetLabel: { fontSize: 12, color: theme.muted },
  budgetCard: { backgroundColor: theme.ink, borderRadius: 20, padding: 18, marginBottom: 18 },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  klein: { fontSize: 10, letterSpacing: 1, color: '#A89E8E' },
  big: { fontSize: 30, fontWeight: '700', color: '#F7F3EC', marginTop: 4 },
  remaining: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  stackTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 6, overflow: 'hidden', flexDirection: 'row' },
  stackPaid: { height: '100%', backgroundColor: '#7FB8A9' },
  stackPlanned: { height: '100%', backgroundColor: 'rgba(127,184,169,0.4)' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 11 },
  legendTxt: { fontSize: 11.5, color: '#C8BFAF' },
  section: { fontSize: 11, letterSpacing: 1, color: '#9A9082', marginBottom: 11 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  catName: { fontSize: 13, fontWeight: '600' },
  catAmount: { fontSize: 13, color: '#7C7263' },
  catTrack: { height: 8, backgroundColor: '#EAE3D7', borderRadius: 5, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: 5 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: theme.border },
  chipOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  chipTxt: { color: theme.muted, fontSize: 12 },
  chipTxtOn: { color: '#fff', fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: theme.card, borderWidth: 1, borderColor: '#EAE3D7', borderRadius: 15, padding: 13 },
  catBadge: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  catInitial: { fontWeight: '600', fontSize: 13 },
  rowTitle: { fontWeight: '600', fontSize: 15, color: theme.ink },
  rowSub: { fontSize: 12, color: '#8A8175', marginTop: 2 },
  rowAmount: { fontWeight: '700', fontSize: 15, color: theme.ink },
  rowBadge: { fontSize: 10.5, fontWeight: '600', marginTop: 2 },
  del: { color: '#C9BFAE', fontSize: 17, paddingLeft: 4 },
  add: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CDBFA6', borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 16 },
  addTxt: { color: theme.primary, fontWeight: '600', fontSize: 14 },
  empty: { color: theme.muted, marginBottom: 8 },
});