// src/components/DayChip.tsx
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Day } from '../types/itinerary';
import { theme } from '../theme/theme';
import { fmtWeekday } from '../utils/format';

export function DayChip({ day, selected, onPress }: {
  day: Day; selected: boolean; onPress: () => void;
}) {
  const d = new Date(day.date);
  return (
    <Pressable onPress={onPress} style={[s.chip, selected && s.on]}>
      <Text style={[s.weekday, selected && s.txtOn]}>{fmtWeekday(day.date)}</Text>
      <Text style={[s.num, selected && s.txtOn]}>{d.getDate()}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  chip: {
    width: 52, flexShrink: 0, paddingVertical: 10, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center',
    marginRight: 8, backgroundColor: theme.card,
  },
  on: { backgroundColor: theme.primary, borderColor: theme.primary },
  weekday: { fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  num: { fontWeight: '700', fontSize: 18, color: theme.ink, marginTop: 2 },
  txtOn: { color: '#fff' },
});