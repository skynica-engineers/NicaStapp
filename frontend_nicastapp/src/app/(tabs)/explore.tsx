import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getTorneos, getAllEquipos, getAllOrganizaciones } from '../../services/api';
import { Skeleton } from '../../components/SkeletonLoader';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../context/FavoritesContext';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#2563EB',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [torneos, setTorneos] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [organizaciones, setOrganizaciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const fetchExploreData = async () => {
    try {
      const [torneosData, equiposData, orgsData] = await Promise.all([
        getTorneos(),
        getAllEquipos(),
        getAllOrganizaciones()
      ]);
      setTorneos(torneosData);
      setEquipos(equiposData);
      setOrganizaciones(orgsData);
    } catch (error) {
      console.error('Error in explore:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExploreData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExploreData();
  }, []);

  const q = searchQuery.toLowerCase().trim();

  const filteredTorneos = torneos.filter(t => 
    t.nombre.toLowerCase().includes(q) || 
    t.deportes?.nombre?.toLowerCase().includes(q)
  );

  const filteredEquipos = equipos.filter(e => 
    e.nombre.toLowerCase().includes(q) || 
    e.municipios?.nombre?.toLowerCase().includes(q) ||
    e.deportes?.nombre?.toLowerCase().includes(q)
  ).sort((a, b) => {
    const aFav = isFavorite(a.id) ? 1 : 0;
    const bFav = isFavorite(b.id) ? 1 : 0;
    return bFav - aFav;
  });

  const filteredOrgs = organizaciones.filter(o => 
    o.nombre.toLowerCase().includes(q) ||
    o.municipios?.nombre?.toLowerCase().includes(q)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar torneos, equipos u organizaciones..."
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

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {isLoading ? (
          <>
            <View style={styles.sectionHeader}><Skeleton width={150} height={20} borderRadius={4} /></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {[1, 2].map((i) => (
                <View key={i} style={styles.torneoCard}>
                  <Skeleton width="100%" height={80} style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                  <View style={{ padding: 12 }}>
                    <Skeleton width="80%" height={16} style={{ marginBottom: 6 }} />
                    <Skeleton width="50%" height={12} />
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={[styles.sectionHeader, { marginTop: 20 }]}><Skeleton width={120} height={20} borderRadius={4} /></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.equipoCard}>
                  <Skeleton width={60} height={60} borderRadius={30} style={{ marginBottom: 8 }} />
                  <Skeleton width={80} height={14} style={{ marginBottom: 4 }} />
                  <Skeleton width={50} height={10} />
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <>
            {/* Torneos Destacados */}
            {(filteredTorneos.length > 0 || q) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Torneos Destacados</Text>
                </View>
                {filteredTorneos.length === 0 ? (
                  <Text style={styles.noResultsText}>No hay torneos que coincidan</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                    {filteredTorneos.map(torneo => (
                      <TouchableOpacity key={torneo.id} style={styles.torneoCard}>
                        <View style={styles.torneoCover}>
                          <Ionicons name="trophy" size={32} color={COLORS.white} style={{ opacity: 0.8 }} />
                        </View>
                        <View style={styles.torneoInfo}>
                          <Text style={styles.torneoName} numberOfLines={1}>{torneo.nombre}</Text>
                          <Text style={styles.torneoSubtitle}>{torneo.deportes?.nombre} • Temp {torneo.temporada}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Equipos Populares */}
            {(filteredEquipos.length > 0 || q) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Equipos</Text>
                </View>
                {filteredEquipos.length === 0 ? (
                  <Text style={styles.noResultsText}>No hay equipos que coincidan</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                    {filteredEquipos.map(equipo => (
                      <View key={equipo.id} style={styles.equipoCard}>
                        <TouchableOpacity style={styles.equipoAvatar} activeOpacity={0.7}>
                          <Text style={styles.equipoAvatarText}>{equipo.nombre.substring(0, 2).toUpperCase()}</Text>
                          <TouchableOpacity 
                            style={styles.favoriteBadge} 
                            onPress={() => toggleFavorite(equipo.id)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name={isFavorite(equipo.id) ? "star" : "star-outline"} size={14} color={isFavorite(equipo.id) ? "#F59E0B" : COLORS.textLight} />
                          </TouchableOpacity>
                        </TouchableOpacity>
                        <Text style={styles.equipoName} numberOfLines={1}>{equipo.nombre}</Text>
                        <View style={styles.sportTag}>
                          <Text style={styles.sportTagText}>{equipo.deportes?.nombre?.toUpperCase() || 'DEPORTE'}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Organizaciones Activas */}
            {(filteredOrgs.length > 0 || q) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Organizaciones Activas</Text>
                </View>
                {filteredOrgs.length === 0 ? (
                  <Text style={styles.noResultsText}>No hay organizaciones que coincidan</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                    {filteredOrgs.map(org => (
                      <TouchableOpacity key={org.id} style={styles.orgCard}>
                        <Feather name="shield" size={24} color={COLORS.primary} style={{ marginBottom: 12 }} />
                        <Text style={styles.orgName} numberOfLines={2}>{org.nombre}</Text>
                        <Text style={styles.orgLocation}>{org.municipios?.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Empty state general */}
            {filteredTorneos.length === 0 && filteredEquipos.length === 0 && filteredOrgs.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="search" size={48} color={COLORS.textLight} style={{ opacity: 0.3 }} />
                <Text style={styles.emptyStateText}>No encontramos resultados para "{searchQuery}"</Text>
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textDark },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: COLORS.textDark },
  content: { paddingBottom: 40 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  seeAll: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  horizontalScroll: { paddingHorizontal: 20, gap: 16 },
  noResultsText: { paddingHorizontal: 20, color: COLORS.textLight, fontStyle: 'italic' },
  
  torneoCard: { width: 260, backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  torneoCover: { height: 90, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  torneoInfo: { padding: 16 },
  torneoName: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  torneoSubtitle: { fontSize: 12, color: COLORS.textLight },

  equipoCard: { width: 100, alignItems: 'center' },
  equipoAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 2, borderColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  favoriteBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.white, borderRadius: 14, padding: 4, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.41 },
  equipoAvatarText: { fontSize: 24, fontWeight: '800', color: COLORS.textDark },
  equipoName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark, textAlign: 'center', marginBottom: 4 },
  sportTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sportTagText: { fontSize: 9, fontWeight: '800', color: COLORS.textLight },
  equipoLocation: { fontSize: 10, color: COLORS.textLight, textAlign: 'center' },

  orgCard: { width: 150, backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  orgName: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  orgLocation: { fontSize: 12, color: COLORS.textLight },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyStateText: { marginTop: 16, fontSize: 16, color: COLORS.textLight, textAlign: 'center' },
});
