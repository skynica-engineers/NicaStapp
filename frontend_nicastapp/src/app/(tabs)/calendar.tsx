import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, RefreshControl, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { getEncuentrosGlobales } from '../../services/api';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#2563EB',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
};

export default function CalendarScreen() {
  const [encuentros, setEncuentros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTorneo, setSelectedTorneo] = useState<string | null>(null);
  const [torneosUnicos, setTorneosUnicos] = useState<{id: string, nombre: string}[]>([]);

  const insets = useSafeAreaInsets();

  const loadData = async () => {
    try {
      const data = await getEncuentrosGlobales();
      setEncuentros(data);

      // Extraer torneos únicos para las burbujas de filtro
      const torneosMap = new Map();
      data.forEach((e: any) => {
        if (e.torneos?.nombre && !torneosMap.has(e.torneo_id)) {
          torneosMap.set(e.torneo_id, { id: e.torneo_id, nombre: e.torneos.nombre });
        }
      });
      setTorneosUnicos(Array.from(torneosMap.values()));
    } catch (error) {
      console.error('Error loading encuentros:', error);
    } finally {
      setLoading(false);
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

  // Función para obtener texto descriptivo de la fecha
  const getSectionTitle = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, "EEEE d 'de' MMMM", { locale: es });
  };

  const getScore = (competidor: any, estado: string) => {
    if (!competidor || estado !== 'finalizado') return '-';
    return competidor.periodos_marcador?.reduce((acc: number, p: any) => acc + Number(p.puntos_acumulados || 0), 0) || 0;
  };

  // Filtrar y agrupar
  const getFilteredAndGroupedData = () => {
    const q = searchQuery.toLowerCase().trim();
    
    // 1. Filtrar
    const filtered = encuentros.filter(item => {
      // Filtro de Torneo
      if (selectedTorneo && item.torneo_id !== selectedTorneo) return false;

      // Filtro de Búsqueda (Texto)
      if (q) {
        const local = item.competidores_encuentro?.find((c: any) => c.rol_posicion_etiqueta?.toLowerCase() === 'local');
        const visitante = item.competidores_encuentro?.find((c: any) => c.rol_posicion_etiqueta?.toLowerCase() === 'visitante');
        
        const terms = [
          item.torneos?.nombre,
          item.sede_instalacion,
          local?.equipos?.nombre,
          visitante?.equipos?.nombre,
          local?.equipos?.municipios?.nombre,
          visitante?.equipos?.municipios?.nombre,
          local?.equipos?.municipios?.departamento?.nombre,
        ].map(t => t?.toLowerCase() || '');

        if (!terms.some(t => t.includes(q))) {
          return false;
        }
      }

      // Por defecto, mostrar programados o en curso (y finalizados recientes si los hay)
      return true;
    });

    // 2. Agrupar por día
    const groups: { [key: string]: any[] } = {};
    filtered.forEach(item => {
      const dateKey = format(parseISO(item.fecha_hora), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });

    // 3. Formatear para SectionList
    const sections = Object.keys(groups)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Ordenar cronológicamente
      .map(dateKey => ({
        title: getSectionTitle(groups[dateKey][0].fecha_hora),
        data: groups[dateKey]
      }));

    return sections;
  };

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title.charAt(0).toUpperCase() + title.slice(1)}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const local = item.competidores_encuentro?.find((c: any) => c.rol_posicion_etiqueta?.toLowerCase() === 'local');
    const visitante = item.competidores_encuentro?.find((c: any) => c.rol_posicion_etiqueta?.toLowerCase() === 'visitante');
    
    const localName = local?.equipos?.nombre || 'Local';
    const visitanteName = visitante?.equipos?.nombre || 'Visitante';
    const localCity = local?.equipos?.municipios?.nombre || '';
    const visitanteCity = visitante?.equipos?.municipios?.nombre || '';
    
    const isFinalizado = item.estado_encuentro === 'finalizado';
    const enCurso = item.estado_encuentro === 'en_curso';

    const getStatusColor = () => {
      if (isFinalizado) return COLORS.textLight;
      if (enCurso) return COLORS.success;
      return COLORS.primary;
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.tournamentName} numberOfLines={1}>{item.torneos?.nombre}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isFinalizado ? '#F1F5F9' : (enCurso ? '#D1FAE5' : '#DBEAFE') }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {isFinalizado ? 'FINALIZADO' : (enCurso ? 'EN CURSO' : 'PROGRAMADO')}
            </Text>
          </View>
        </View>

        <View style={styles.matchRow}>
          <View style={styles.teamContainer}>
            <View style={styles.placeholderLogo}>
              <Text style={styles.logoText}>{localName.substring(0,2).toUpperCase()}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={2}>{localName}</Text>
            {localCity ? <Text style={styles.cityText} numberOfLines={1}>{localCity}</Text> : null}
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.timeText}>{format(parseISO(item.fecha_hora), 'HH:mm')}</Text>
            {isFinalizado || enCurso ? (
              <View style={styles.scoreWrapper}>
                <Text style={styles.scoreText}>{getScore(local, item.estado_encuentro)}</Text>
                <Text style={styles.vsText}> - </Text>
                <Text style={styles.scoreText}>{getScore(visitante, item.estado_encuentro)}</Text>
              </View>
            ) : (
              <Text style={styles.vsTextLarge}>VS</Text>
            )}
          </View>

          <View style={styles.teamContainer}>
            <View style={styles.placeholderLogo}>
              <Text style={styles.logoText}>{visitanteName.substring(0,2).toUpperCase()}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={2}>{visitanteName}</Text>
            {visitanteCity ? <Text style={styles.cityText} numberOfLines={1}>{visitanteCity}</Text> : null}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.locationWrapper}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.stadiumText} numberOfLines={1}>{item.sede_instalacion || 'Sede por confirmar'}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const sections = getFilteredAndGroupedData();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendario</Text>
        
        {/* Barra de búsqueda */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por equipo, municipio o sede..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Burbujas de Filtro de Torneos */}
        {torneosUnicos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <TouchableOpacity 
              style={[styles.filterBubble, selectedTorneo === null && styles.filterBubbleActive]}
              onPress={() => setSelectedTorneo(null)}
            >
              <Text style={[styles.filterText, selectedTorneo === null && styles.filterTextActive]}>Todos</Text>
            </TouchableOpacity>
            {torneosUnicos.map(torneo => (
              <TouchableOpacity 
                key={torneo.id}
                style={[styles.filterBubble, selectedTorneo === torneo.id && styles.filterBubbleActive]}
                onPress={() => setSelectedTorneo(torneo.id)}
              >
                <Text style={[styles.filterText, selectedTorneo === torneo.id && styles.filterTextActive]}>{torneo.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No hay partidos que coincidan con la búsqueda</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.background, 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    height: 44,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.textDark },
  filtersScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  filterBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBubbleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  
  // Lista y Secciones
  listContainer: {
    paddingBottom: 40,
  },
  sectionHeaderContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  
  // Card de Partido
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tournamentName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  placeholderLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 2,
  },
  cityText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  scoreContainer: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  scoreWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
    marginHorizontal: 8,
  },
  vsTextLarge: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.border,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    backgroundColor: '#F8FAFC',
    marginHorizontal: -16,
    marginBottom: -16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingBottom: 12,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stadiumText: {
    fontSize: 12,
    color: COLORS.textDark,
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
