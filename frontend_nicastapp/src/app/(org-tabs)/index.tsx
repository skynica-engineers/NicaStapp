import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrgContext } from '../../context/OrgContext';
import { getOrganizacionById } from '../../services/api';
import { Skeleton } from '../../components/SkeletonLoader';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
  badge: '#DC2626',
};

export default function OrgPanelScreen() {
  const { activeOrg } = useOrgContext();
  const insets = useSafeAreaInsets();
  const [orgData, setOrgData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      if (!activeOrg?.id) return;
      setIsLoading(true);
      try {
        const data = await getOrganizacionById(activeOrg.id);
        setOrgData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeOrg?.id]));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Skeleton Header */}
        <View style={styles.header}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <Skeleton width={120} height={20} />
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
          {/* Skeleton Hero */}
          <View style={[styles.heroCard, { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border }]}>
             <Skeleton width={52} height={52} borderRadius={26} style={{ marginBottom: 12 }} />
             <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
             <Skeleton width="40%" height={16} style={{ marginBottom: 24 }} />
             
             <View style={styles.statsRow}>
                <View style={styles.statItem}><Skeleton width={40} height={20} /><Skeleton width={50} height={12} style={{ marginTop: 4 }}/></View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}><Skeleton width={40} height={20} /><Skeleton width={50} height={12} style={{ marginTop: 4 }}/></View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}><Skeleton width={60} height={20} /><Skeleton width={60} height={12} style={{ marginTop: 4 }}/></View>
             </View>
          </View>

          {/* Skeleton Quick Actions */}
          <View style={styles.section}>
             <Skeleton width={150} height={20} style={{ marginBottom: 16 }} />
             <View style={styles.actionsGrid}>
                {[1, 2, 3].map(i => (
                  <View key={i} style={[styles.quickAction, { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border }]}>
                     <Skeleton width={44} height={44} borderRadius={22} style={{ marginBottom: 12 }} />
                     <Skeleton width={60} height={12} style={{ marginBottom: 4 }} />
                     <Skeleton width={50} height={12} />
                  </View>
                ))}
             </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const torneos = orgData?.torneos ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Feather name="flag" size={24} color={COLORS.primary} />
          <Text style={styles.logoText}>NICASTAPP</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellIcon}>
            <Feather name="bell" size={24} color={COLORS.primary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={20} color={COLORS.primary} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
        {/* Org Hero */}
        <LinearGradient
          colors={['#0F172A', '#1E3A8A', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroIconWrap}>
            <Feather name="shield" size={26} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>{activeOrg?.nombre}</Text>
          <Text style={styles.heroSubtitle}>{activeOrg?.tipo_institucion}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{torneos.length}</Text>
              <Text style={styles.statLabel}>Torneos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {torneos.filter((t: any) => t.estado !== 'finalizado').length}
              </Text>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{orgData?.municipios?.nombre?.split(',')[0] ?? '—'}</Text>
              <Text style={styles.statLabel}>Municipio</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push(`/organizaciones/${activeOrg?.id}/torneos/create`)}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="plus-circle" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.quickLabel}>Nuevo{'\n'}Torneo</Text>
            </TouchableOpacity>



            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(org-tabs)/torneos')}>
              <View style={[styles.quickIcon, { backgroundColor: '#D1FAE5' }]}>
                <Feather name="award" size={22} color={COLORS.success} />
              </View>
              <Text style={styles.quickLabel}>Mis{'\n'}Torneos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(org-tabs)/acreditaciones')}>
              <View style={[styles.quickIcon, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="users" size={22} color="#D97706" />
              </View>
              <Text style={styles.quickLabel}>Personal{'\n'}Técnico</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Torneos */}
        {torneos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Torneos recientes</Text>
            {torneos.slice(0, 3).map((torneo: any) => (
              <TouchableOpacity
                key={torneo.id}
                style={styles.torneoCard}
                onPress={() => router.push(`/organizaciones/${activeOrg?.id}/torneos/${torneo.id}`)}
              >
                <View style={styles.torneoIcon}>
                  <Feather name="award" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.torneoInfo}>
                  <Text style={styles.torneoName}>{torneo.nombre}</Text>
                  <Text style={styles.torneoDetails}>{torneo.deportes?.nombre} • {torneo.temporada}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginLeft: 8, letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  bellIcon: { marginRight: 16, position: 'relative' },
  notificationDot: { position: 'absolute', top: -2, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.badge, borderWidth: 1.5, borderColor: COLORS.background },
  avatarContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },

  heroCard: { borderRadius: 20, padding: 20, marginBottom: 24, elevation: 8, shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10 },
  heroIconWrap: { width: 50, height: 50, borderRadius: 14, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, letterSpacing: -0.4, marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },

  actionsGrid: { flexDirection: 'row', gap: 12 },
  quickAction: { flex: 1, backgroundColor: COLORS.white, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  quickIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textDark, textAlign: 'center' },

  torneoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, gap: 12 },
  torneoIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  torneoInfo: { flex: 1 },
  torneoName: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  torneoDetails: { fontSize: 12, color: COLORS.textLight },
});
