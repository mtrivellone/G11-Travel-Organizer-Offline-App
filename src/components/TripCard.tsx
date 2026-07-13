import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Trip } from '../types/trip';
import { theme } from '../theme/theme';
import { fmtRange } from '../utils/format';
import { statusLabels } from '../constants/categories';

export function TripCard({ trip, onPress, onLongPress }: { trip: Trip; onPress: () => void; onLongPress?: () => void }) {
  return (
    <Pressable style={s.card} onPress={onPress} onLongPress={onLongPress}>
      <View style={[s.cover, { backgroundColor: trip.cover[0] }]}>
        <Text style={s.coverInitial}>{trip.destination.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={s.body}>
        <Text style={s.dest}>{trip.destination.toUpperCase()}</Text>
        <Text style={s.title}>{trip.title}</Text>
        <Text style={s.meta}>{fmtRange(trip.start, trip.end)} · {statusLabels[trip.status]}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.border, marginBottom: 14, overflow: 'hidden' },
  cover: { height: 90 },
  body: { padding: 14 },
  dest: { fontSize: 11, color: theme.muted, letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: '700', color: theme.ink, marginTop: 2 },
  meta: { fontSize: 13, color: theme.muted, marginTop: 6 },
  coverInitial: {
    position: 'absolute', right: 10, bottom: -10,
    fontSize: 64, fontWeight: '800', color: 'rgba(255,255,255,0.25)',
  },
});