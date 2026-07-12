import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Activity } from '../types/itinerary';
import { categories } from '../constants/categories';
import { theme } from '../theme/theme';
import { fmtEuro } from '../utils/format';

type Props = { activity: Activity; onToggle?: () => void; onPress?: () => void; onDelete?: () => void };

const STATUS_META = {
  todo: { label: 'Da fare', bg: theme.card, txt: theme.muted, border: theme.border },
  done: { label: 'Fatta', bg: theme.primary, txt: '#fff', border: theme.primary },
  cancelled: { label: 'Annullata', bg: theme.danger, txt: '#fff', border: theme.danger },
} as const;

export function ActivityCard({ activity, onToggle, onPress, onDelete }: Props) {
  const cat = categories[activity.category] ?? categories.libero;
  const meta = STATUS_META[activity.status];

  return (
    <Pressable style={s.row} onPress={onPress}>
      <View style={[s.dot, { backgroundColor: cat.color }]} />
      <Text style={s.time}>{activity.time}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[s.title, activity.status === 'cancelled' && s.strike]}>{activity.title}</Text>
        <Text style={s.sub}>{activity.place} · {cat.label}{activity.cost ? ` · ${fmtEuro(activity.cost)}` : ''}</Text>
      </View>
      <Pressable onPress={onToggle} style={[s.badge, { backgroundColor: meta.bg, borderColor: meta.border }]}>
        <Text style={[s.badgeTxt, { color: meta.txt }]}>{meta.label}</Text>
      </Pressable>
      {onDelete && <Pressable onPress={onDelete}><Text style={s.del}>✕</Text></Pressable>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.card, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  time: { fontWeight: '700', color: theme.ink, fontSize: 12, width: 40 },
  title: { color: theme.ink, fontWeight: '600' },
  strike: { textDecorationLine: 'line-through', color: theme.muted },
  sub: { color: theme.muted, fontSize: 12, marginTop: 2 },
  badge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  del: { color: theme.muted, fontSize: 16, paddingHorizontal: 4 },
});