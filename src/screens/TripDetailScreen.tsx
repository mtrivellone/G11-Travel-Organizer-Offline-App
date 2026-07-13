import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTripStore } from '../stores/tripStore';
import { ItineraryTab } from './tabs/ItineraryTab';
import { ChecklistTab } from './tabs/ChecklistTab';
import { ExpensesTab } from './tabs/ExpensesTab';
import { InfoTab } from './tabs/InfoTab';
import { duplicateTrip } from '../features/duplicationService';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { statusLabels } from '../constants/categories';
import { theme } from '../theme/theme';

const TABS = ['Itinerario', 'Checklist', 'Spese', 'Info'] as const;

export function TripDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { tripId } = route.params;
  const { getById, deleteTrip, load } = useTripStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Itinerario');
  const insets = useSafeAreaInsets();

  useEffect(() => { if (!getById(tripId)) load(); }, []);
  const trip = getById(tripId);

  const onDuplicate = async () => {
    const newId = await duplicateTrip(tripId);
    nav.replace('TripDetail', { tripId: newId });
  };

  const onDelete = () =>
    Alert.alert('Eliminare il viaggio?', 'Azione non annullabile.', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Elimina', style: 'destructive', onPress: async () => { await deleteTrip(tripId); nav.goBack(); } },
    ]);

  return (
    <View style={s.wrap}>
      {/* striscia bianca alta quanto la status bar */}
      <View style={{ height: insets.top, backgroundColor: '#fff' }} />

      {/* banner: indietro a sinistra, Timeline+Duplica a destra, testi allineati in basso */}
      {trip && (
        <View style={s.banner}>
          <Svg style={StyleSheet.absoluteFillObject} viewBox="0 0 400 190" preserveAspectRatio="none">
            <Defs>
              <SvgGradient id="cover" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={trip.cover[0]} />
                <Stop offset="1" stopColor={trip.cover[1]} />
              </SvgGradient>
            </Defs>
            <Rect width="400" height="190" fill="url(#cover)" />
          </Svg>

          <Pressable style={s.backBtn} onPress={() => nav.goBack()}>
            <Text style={s.backTxt}>‹</Text>
          </Pressable>

          <View style={s.bannerActions}>
            <Pressable style={s.bannerPill} onPress={() => nav.navigate('Timeline', { tripId })}>
              <Text style={s.bannerPillTxt}>Timeline</Text>
            </Pressable>
            <Pressable style={s.bannerPill} onPress={onDuplicate}>
              <Text style={s.bannerPillTxt}>Duplica</Text>
            </Pressable>
          </View>

          <Text style={s.bannerInitial}>{trip.destination[0]}</Text>

          <View style={s.bannerBottom}>
            <Text style={s.bannerBadge}>{statusLabels[trip.status]}</Text>
            <Text style={s.bannerDest}>{trip.destination.toUpperCase()}</Text>
            <Text style={s.bannerTitle} numberOfLines={2}>{trip.title}</Text>
          </View>
        </View>
      )}

      {/* tab */}
      <View style={s.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && s.tabOn]}>
            <Text style={tab === t ? s.tabTxtOn : s.tabTxt}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {/* contenuto */}
      <View style={{ flex: 1 }}>
        {tab === 'Itinerario' && <ItineraryTab tripId={tripId} />}
        {tab === 'Checklist' && <ChecklistTab tripId={tripId} />}
        {tab === 'Spese' && <ExpensesTab tripId={tripId} />}
        {tab === 'Info' && <InfoTab tripId={tripId} />}
      </View>

      {/* elimina — fissa in basso */}
      <Pressable style={s.deleteBar} onPress={onDelete}>
        <Text style={s.deleteTxt}>Elimina viaggio</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.background },

  banner: { height: 172, position: 'relative', overflow: 'hidden' },

  backBtn: {
    position: 'absolute', top: 14, left: 16, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
  },
  backTxt: { fontSize: 20, color: theme.ink, marginTop: -2 },

  bannerActions: { position: 'absolute', top: 14, right: 16, flexDirection: 'row', gap: 8 },
  bannerPill: {
    height: 36, paddingHorizontal: 14, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
  },
  bannerPillTxt: { fontSize: 13, fontWeight: '600', color: theme.ink },

  bannerInitial: {
    position: 'absolute', right: 14, bottom: -18,
    fontSize: 100, fontWeight: '800', color: 'rgba(255,255,255,0.18)',
  },

  bannerBottom: { position: 'absolute', left: 20, right: 20, bottom: 16 },
  bannerBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.92)',
    color: theme.ink, fontWeight: '600', fontSize: 11,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    marginBottom: 8, overflow: 'hidden',
  },
  bannerDest: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
  bannerTitle: { color: '#fff', fontSize: 23, fontWeight: '800', lineHeight: 27, letterSpacing: -0.3 },

  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginVertical: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  tabOn: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  tabTxt: { color: theme.muted }, tabTxtOn: { color: theme.primary, fontWeight: '700' },

  deleteBar: {
    paddingVertical: 14, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.background,
  },
  deleteTxt: { color: theme.danger, fontWeight: '600', fontSize: 14 },
});