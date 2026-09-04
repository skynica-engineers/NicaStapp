import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTorneos, getTorneoTablas } from '../../services/api';
import { Feather, Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#2563EB',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export default function StandingsScreen() {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeTorneoId, setActiveTorneoId] = useState<string | null>(null);
  const [activeTorneoData, setActiveTorneoData] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTorneos = async () => {
    try {
      const data = await getTorneos();
      setTorneos(data);
    } catch (error) {
      console.error('Error in standings:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTorneos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTorneos();
  }, []);

  const handleSelectTorneo = async (id: string) => {
    setActiveTorneoId(id);
    setIsDetailLoading(true);
    try {
      const data = await getTorneoTablas(id);
      setActiveTorneoData(data);
    } catch (error) {
      console.error('Error loading tournament details:', error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const calculateStandings = () => {
    if (!activeTorneoData?.encuentros) return [];

    const statsMap = new Map<string, any>();

    // Inicializar o actualizar estadísticas por cada encuentro finalizado
    activeTorneoData.encuentros.forEach((encuentro: any) => {
      if (encuentro.estado_encuentro !== 'finalizado') return;

      const competidores = encuentro.competidores_encuentro || [];
      if (competidores.length !== 2) return;

      // Calcular goles/puntos de cada uno
      const score0 = competidores[0].periodos_marcador?.reduce((acc: number, p: any) => acc + Number(p.puntos_acumulados || 0), 0) || 0;
      const score1 = competidores[1].periodos_marcador?.reduce((acc: number, p: any) => acc + Number(p.puntos_acumulados || 0), 0) || 0;

      const team0 = competidores[0].equipos;
      const team1 = competidores[1].equipos;

      if (!team0 || !team1) return;

      // Init in map if not exists
      [team0, team1].forEach((team) => {
        if (!statsMap.has(team.id)) {
          statsMap.set(team.id, { id: team.id, nombre: team.nombre, jj: 0, jg: 0, jp: 0, je: 0, pts: 0 });
        }
      });

      const stats0 = statsMap.get(team0.id);
      const stats1 = statsMap.get(team1.id);

      stats0.jj += 1;
      stats1.jj += 1;

      if (score0 > score1) {
        stats0.jg += 1;
        stats0.pts += 3;
        stats1.jp += 1;
      } else if (score1 > score0) {
        stats1.jg += 1;
        stats1.pts += 3;
        stats0.jp += 1;
      } else {
        // Empate
        stats0.je += 1;
        stats1.je += 1;
        stats0.pts += 1;
        stats1.pts += 1;
      }
    });

    // Convert to array and sort by Points
    return Array.from(statsMap.values()).sort((a, b) => b.pts - a.pts);
  };

  // --- RENDERS ---

  const renderListView = () => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = torneos.filter(t => {
      const locationName = t.organizaciones?.municipios?.nombre || '';
      const deptName = t.organizaciones?.municipios?.departamento?.nombre || '';
      return (
        t.nombre.toLowerCase().includes(q) ||
        locationName.toLowerCase().includes(q) ||
        deptName.toLowerCase().includes(q)
      );
    });

    return (
      <View style={styles.flex1}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por torneo o municipio..."
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

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyStateText}>No se encontraron torneos</Text>
              </View>
            ) : (
              filtered.map(torneo => {
                const location = torneo.organizaciones?.municipios?.nombre || 'General';
                return (
                  <TouchableOpacity key={torneo.id} style={styles.torneoCard} onPress={() => handleSelectTorneo(torneo.id)}>
                    <View style={styles.torneoIcon}>
                      <Ionicons name="podium" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.torneoInfo}>
                      <Text style={styles.torneoName} numberOfLines={1}>{torneo.nombre}</Text>
                      <Text style={styles.torneoLocation}>{torneo.deportes?.nombre} • {location}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                )
              })
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderDetailView = () => {
    if (isDetailLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (!activeTorneoData) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No se pudo cargar la información</Text>
        </View>
      );
    }

    const standings = calculateStandings();

    return (
      <View style={styles.flex1}>
        {/* Back Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setActiveTorneoId(null)} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={styles.detailTitle} numberOfLines={1}>{activeTorneoData.nombre}</Text>
            <Text style={styles.detailSubtitle}>{activeTorneoData.deportes?.nombre}</Text>
          </View>
        </View>

        {standings.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="bar-chart-2" size={48} color={COLORS.border} />
            <Text style={styles.emptyStateText}>Aún no hay partidos finalizados para calcular la tabla</Text>
          </View>
        ) : (
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.posCol]}>#</Text>
              <Text style={[styles.headerCell, styles.teamCol]}>EQUIPO</Text>
              <Text style={[styles.headerCell, styles.numCol]}>JJ</Text>
              <Text style={[styles.headerCell, styles.numCol]}>JG</Text>
              <Text style={[styles.headerCell, styles.numCol]}>JP</Text>
              <Text style={[styles.headerCell, styles.numCol]}>JE</Text>
              <Text style={[styles.headerCell, styles.ptsCol]}>PTS</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {standings.map((team, index) => (
                <View key={team.id} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.rowCell, styles.posCol, styles.boldText]}>{index + 1}</Text>
                  <Text style={[styles.rowCell, styles.teamCol, styles.boldText]} numberOfLines={1}>{team.nombre}</Text>
                  <Text style={[styles.rowCell, styles.numCol]}>{team.jj}</Text>
                  <Text style={[styles.rowCell, styles.numCol]}>{team.jg}</Text>
                  <Text style={[styles.rowCell, styles.numCol]}>{team.jp}</Text>
                  <Text style={[styles.rowCell, styles.numCol]}>{team.je}</Text>
                  <Text style={[styles.rowCell, styles.ptsCol, styles.boldPrimary]}>{team.pts}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {!activeTorneoId && (
        <View style={styles.mainHeader}>
          <Text style={styles.mainHeaderTitle}>Tablas de Posiciones</Text>
          <Text style={styles.mainHeaderSubtitle}>Selecciona un torneo para ver su estado actual</Text>
        </View>
      )}

      {activeTorneoId ? renderDetailView() : renderListView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex1: { flex: 1 },
  mainHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: COLORS.white },
  mainHeaderTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textDark },
  mainHeaderSubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  
  searchContainer: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 16, height: 46 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: COLORS.textDark },
  
  listContent: { padding: 16, paddingBottom: 40 },
  torneoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  torneoIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  torneoInfo: { flex: 1 },
  torneoName: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  torneoLocation: { fontSize: 13, color: COLORS.textLight, fontWeight: '500' },
  
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyStateText: { marginTop: 16, fontSize: 15, color: COLORS.textLight, textAlign: 'center' },
  
  // Detail View
  detailHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { padding: 4 },
  detailTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  detailSubtitle: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  
  tableWrapper: { flex: 1, backgroundColor: COLORS.white, margin: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerCell: { fontSize: 12, fontWeight: '800', color: COLORS.textLight, textTransform: 'uppercase' },
  
  tableRow: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.background },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  rowCell: { fontSize: 14, color: COLORS.textDark },
  boldText: { fontWeight: '700' },
  boldPrimary: { fontWeight: '800', color: COLORS.primary },
  
  posCol: { width: 40, textAlign: 'center' },
  teamCol: { flex: 1, paddingRight: 8 },
  numCol: { width: 35, textAlign: 'center' },
  ptsCol: { width: 45, textAlign: 'center' },
});
