import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { Image } from 'expo-image';
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
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const upcomingMatches = feed.filter(f => f.estado_encuentro === 'programado');

  const getFilteredMatches = (matches: any[]) => {
    let filtered = matches;
    
    // Filtrar por deporte
    if (activeFilterId !== null) {
      filtered = filtered.filter(m => Number(m.torneos?.deporte_id) === Number(activeFilterId));
    }
    
    // Filtrar por texto (Torneo, Equipo, Municipio o Departamento)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => {
        const torneoMatch = m.torneos?.nombre?.toLowerCase().includes(q);
        
        const equipoA = m.competidores_encuentro[0]?.equipos;
        const equipoB = m.competidores_encuentro[1]?.equipos;

        const equipoAMatch = equipoA?.nombre?.toLowerCase().includes(q) || 
                             equipoA?.municipios?.nombre?.toLowerCase().includes(q) || 
                             equipoA?.municipios?.departamento?.nombre?.toLowerCase().includes(q);
                             
        const equipoBMatch = equipoB?.nombre?.toLowerCase().includes(q) || 
                             equipoB?.municipios?.nombre?.toLowerCase().includes(q) || 
                             equipoB?.municipios?.departamento?.nombre?.toLowerCase().includes(q);
                             
        return torneoMatch || equipoAMatch || equipoBMatch;
      });
    }
    
    return filtered;
  };

  const filteredUpcomingMatches = getFilteredMatches(upcomingMatches);

  const renderMatchCard = (match: any) => {
    const equipoA = match.competidores_encuentro[0]?.equipos?.nombre || 'Por definir';
    const equipoB = match.competidores_encuentro[1]?.equipos?.nombre || 'Por definir';
    const municipioA = match.competidores_encuentro[0]?.equipos?.municipios?.nombre || '';
    const municipioB = match.competidores_encuentro[1]?.equipos?.municipios?.nombre || '';
    
    return (
      <View key={match.id} style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <Text style={styles.torneoName}>{match.torneos?.nombre || 'Torneo General'}</Text>
          <Text style={styles.matchDate}>
            {new Date(match.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.teamsContainer}>
          <Text style={styles.teamText} numberOfLines={1}>{equipoA} {municipioA ? `(${municipioA})` : ''}</Text>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.teamText} numberOfLines={1}>{equipoB} {municipioB ? `(${municipioB})` : ''}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/LogoSinFondo.png')} 
              style={{ width: 36, height: 36 }} 
              contentFit="contain" 
            />
            <Text style={styles.logoText}>NICASTAPP</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push('/profile')}
            >
              <Feather name="user" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting Section & Search */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hola{userName ? `, ${userName}` : ''}</Text>
          <Text style={styles.greetingSubtitle}>Mantente al tanto de la acción deportiva local.</Text>
          
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Buscar torneo, equipo, municipio..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
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
              {[1, 2, 3].map((i) => (
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
          </View>
        ) : (
          <>
            {/* Upcoming Events Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos eventos</Text>
            </View>

            {filteredUpcomingMatches.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Feather name="calendar" size={32} color={COLORS.textLight} style={{ opacity: 0.5 }} />
                <Text style={styles.emptyStateText}>No se encontraron eventos</Text>
              </View>
            ) : (
              <View style={styles.verticalFeed}>
                {filteredUpcomingMatches.map(m => renderMatchCard(m))}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginLeft: 8, letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  bellIcon: { marginRight: 16, position: 'relative' },
  notificationDot: { position: 'absolute', top: -2, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.badge, borderWidth: 1.5, borderColor: COLORS.white },
  avatarContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  greetingSection: { paddingHorizontal: 20, marginBottom: 20, backgroundColor: COLORS.white, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  greetingTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  greetingSubtitle: { fontSize: 14, color: COLORS.textLight },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, marginTop: 16, height: 48 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textDark },
  filtersWrapper: { marginBottom: 12, backgroundColor: COLORS.background },
  filtersContainer: { paddingHorizontal: 20, gap: 12, paddingVertical: 8 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  activeFilterChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  inactiveFilterChip: { backgroundColor: COLORS.white, borderColor: COLORS.border },
  filterText: { fontSize: 14, fontWeight: '600' },
  activeFilterText: { color: COLORS.white },
  inactiveFilterText: { color: COLORS.textLight },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.white, borderTopWidth: 8, borderTopColor: '#E2E8F0', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  liveIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginRight: 8, opacity: 0.8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
  emptyStateContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, marginHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', marginTop: 16 },
  emptyStateText: { marginTop: 12, fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
  verticalFeed: { width: '100%', backgroundColor: '#E2E8F0' },
  matchCard: { backgroundColor: COLORS.white, padding: 20, width: '100%', marginBottom: 8 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  torneoName: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626', marginRight: 4 },
  liveText: { fontSize: 10, fontWeight: '700', color: '#DC2626' },
  matchDate: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  teamsContainer: { gap: 12, alignItems: 'center', paddingVertical: 8 },
  teamText: { fontSize: 20, fontWeight: '800', color: COLORS.textDark, textAlign: 'center' },
  vsText: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  loaderContainer: { paddingVertical: 40, alignItems: 'center' }
});
