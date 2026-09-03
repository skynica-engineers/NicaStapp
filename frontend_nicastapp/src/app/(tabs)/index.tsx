import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getDeportes, getHomeFeed } from '../../services/api';
import { Skeleton } from '../../components/SkeletonLoader';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#2563EB',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  error: '#E63946',
  badge: '#DC2626',
};

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [filters, setFilters] = useState<any[]>([]);
  const [activeFilterId, setActiveFilterId] = useState<number | null>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar Usuario
        const userDataStr = await AsyncStorage.getItem('@user');
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          if (user.nombreCompleto) {
            setUserName(user.nombreCompleto.split(' ')[0]);
          }
        }
        
        // Cargar Deportes (Filtros)
        const deportesData = await getDeportes();
        setFilters([{ id: null, nombre: 'Todos' }, ...deportesData]);
        
        // Cargar Feed
        const feedData = await getHomeFeed();
        setFeed(feedData);

      } catch (e) {
        console.error('Error loading home data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const liveMatches = feed.filter(f => f.estado_encuentro === 'en_curso');
  const upcomingMatches = feed.filter(f => f.estado_encuentro === 'programado');

  const getFilteredMatches = (matches: any[]) => {
    if (activeFilterId === null) return matches;
    return matches.filter(m => m.torneos?.deporte_id === activeFilterId);
  };

  const filteredLiveMatches = getFilteredMatches(liveMatches);
  const filteredUpcomingMatches = getFilteredMatches(upcomingMatches);

  const renderMatchCard = (match: any, isLive: boolean) => {
    const equipoA = match.competidores_encuentro[0]?.equipos?.nombre || 'Por definir';
    const equipoB = match.competidores_encuentro[1]?.equipos?.nombre || 'Por definir';
    
    return (
      <View key={match.id} style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <Text style={styles.torneoName}>{match.torneos?.nombre || 'Torneo General'}</Text>
          {isLive ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>EN VIVO</Text>
            </View>
          ) : (
            <Text style={styles.matchDate}>
              {new Date(match.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
        <View style={styles.teamsContainer}>
          <Text style={styles.teamText} numberOfLines={1}>{equipoA}</Text>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.teamText} numberOfLines={1}>{equipoB}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
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
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push('/profile')}
            >
              <Feather name="user" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hola{userName ? `, ${userName}` : ''}</Text>
          <Text style={styles.greetingSubtitle}>Mantente al tanto de la acción deportiva local.</Text>
        </View>

        {/* Filters */}
        {filters.length > 0 && (
          <View style={styles.filtersWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
              {filters.map((filter) => {
                const isActive = activeFilterId === filter.id;
                return (
                  <TouchableOpacity
                    key={filter.id ?? 'all'}
                    onPress={() => setActiveFilterId(filter.id)}
                    style={[styles.filterChip, isActive ? styles.activeFilterChip : styles.inactiveFilterChip]}
                  >
                    <Text style={[styles.filterText, isActive ? styles.activeFilterText : styles.inactiveFilterText]}>
                      {filter.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {isLoading ? (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
               <Skeleton width={100} height={24} borderRadius={6} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
              {[1, 2].map((i) => (
                <View key={i} style={[styles.matchCard, { padding: 16 }]}>
                  <View style={styles.matchHeader}>
                    <Skeleton width={80} height={12} />
                    <Skeleton width={60} height={20} borderRadius={10} />
                  </View>
                  <View style={styles.teamsContainer}>
                    <Skeleton width={120} height={20} style={{ marginBottom: 4 }} />
                    <Skeleton width={20} height={16} />
                    <Skeleton width={120} height={20} style={{ marginTop: 4 }} />
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 10 }}>
               <Skeleton width={140} height={24} borderRadius={6} />
            </View>
            <View style={{ gap: 16 }}>
               {[1, 2].map((i) => (
                 <View key={i} style={[styles.matchCard, { padding: 16, width: '100%' }]}>
                  <View style={styles.matchHeader}>
                    <Skeleton width={100} height={12} />
                    <Skeleton width={50} height={12} />
                  </View>
                  <View style={styles.teamsContainer}>
                    <Skeleton width="40%" height={20} style={{ marginBottom: 4 }} />
                    <Skeleton width={20} height={16} />
                    <Skeleton width="40%" height={20} style={{ marginTop: 4 }} />
                  </View>
                 </View>
               ))}
            </View>
          </View>
        ) : (
          <>
            {/* Live Now Section */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.liveIndicator} />
                <Text style={styles.sectionTitle}>En vivo ahora</Text>
              </View>
            </View>

            {filteredLiveMatches.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Feather name="activity" size={32} color={COLORS.textLight} style={{ opacity: 0.5 }} />
                <Text style={styles.emptyStateText}>No hay partidos en vivo en este momento</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchesScroll}>
                {filteredLiveMatches.map(m => renderMatchCard(m, true))}
              </ScrollView>
            )}

            {/* Upcoming Events Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos eventos</Text>
            </View>

            {filteredUpcomingMatches.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Feather name="calendar" size={32} color={COLORS.textLight} style={{ opacity: 0.5 }} />
                <Text style={styles.emptyStateText}>No hay próximos eventos para esta selección</Text>
              </View>
            ) : (
              <View style={styles.verticalList}>
                {filteredUpcomingMatches.map(m => renderMatchCard(m, false))}
              </View>
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginLeft: 8, letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  bellIcon: { marginRight: 16, position: 'relative' },
  notificationDot: { position: 'absolute', top: -2, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.badge, borderWidth: 1.5, borderColor: COLORS.background },
  avatarContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  greetingSection: { paddingHorizontal: 20, marginBottom: 20 },
  greetingTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  greetingSubtitle: { fontSize: 14, color: COLORS.textLight },
  filtersWrapper: { marginBottom: 28 },
  filtersContainer: { paddingHorizontal: 20, gap: 12 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  activeFilterChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  inactiveFilterChip: { backgroundColor: COLORS.white, borderColor: COLORS.border },
  filterText: { fontSize: 14, fontWeight: '600' },
  activeFilterText: { color: COLORS.white },
  inactiveFilterText: { color: COLORS.textLight },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  liveIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginRight: 8, opacity: 0.8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textDark },
  emptyStateContainer: { paddingVertical: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', marginBottom: 32 },
  emptyStateText: { marginTop: 12, fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
  matchesScroll: { paddingHorizontal: 20, gap: 16, paddingBottom: 24 },
  verticalList: { paddingHorizontal: 20, gap: 16 },
  matchCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, width: 280, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: COLORS.border },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  torneoName: { fontSize: 12, fontWeight: '600', color: COLORS.textLight, textTransform: 'uppercase' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626', marginRight: 4 },
  liveText: { fontSize: 10, fontWeight: '700', color: '#DC2626' },
  matchDate: { fontSize: 12, fontWeight: '600', color: COLORS.textDark },
  teamsContainer: { gap: 8, alignItems: 'center' },
  teamText: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, textAlign: 'center' },
  vsText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  loaderContainer: { paddingVertical: 40, alignItems: 'center' }
});
