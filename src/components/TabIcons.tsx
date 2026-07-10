import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export function PlaneIcon({ color }: { color: string }) {
  return <Text style={[s.plane, { color }]}>✈</Text>;
}

export function ChartIcon({ color }: { color: string }) {
  return (
    <View style={s.chart}>
      <View style={[s.bar, { height: 8, backgroundColor: color }]} />
      <View style={[s.bar, { height: 14, backgroundColor: color }]} />
      <View style={[s.bar, { height: 20, backgroundColor: color }]} />
    </View>
  );
}

const s = StyleSheet.create({
  plane: { fontSize: 20, transform: [{ rotate: '45deg' }] },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 20 },
  bar: { width: 4, borderRadius: 2 },
});