import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
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
};

export default function OrgTorneosScreen() {
  const { activeOrg } = useOrgContext();
  const insets = useSafeAreaInsets();
  const [torneos, setTorneos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'en_curso' | 'finalizado'>('en_curso');

  useFocusEffect(useCallback(() => {
    const load = async () => {
      if (!activeOrg?.id) return;
      setIsLoading(true);
      try {
        const data = await getOrganizacionById(activeOrg.id);
        setTorneos(data?.torneos ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeOrg?.id]));

  // 1. Filter by status and search
  const filteredTorneos = useMemo(() => {
    return torneos.filter(t => {
      // Si el campo estado no existe todavía (API sin actualizar), asumimos 'en_curso'
      const estado = t.estado || 'en_curso';
      const matchesStatus = estado === activeTab;
      const matchesSearch = t.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [torneos, activeTab, searchQuery]);

  // 2. Group by temporada
  const groupedTorneos = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredTorneos.forEach(t => {
      const temp = t.temporada || 'Sin Temporada';
      if (!groups[temp]) groups[temp] = [];
      groups[temp].push(t);
    });
    // Convert to array and sort keys (optional, but let's just sort alphabetically descending for seasons)
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredTorneos]);

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'en_curso' && styles.tabBtnActive]}
        onPress={() => setActiveTab('en_curso')}
      >
        <Text style={[styles.tabText, activeTab === 'en_curso' && styles.tabTextActive]}>En Curso</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'finalizado' && styles.tabBtnActive]}
        onPress={() => setActiveTab('finalizado')}
      >
        <Text style={[styles.tabText, activeTab === 'finalizado' && styles.tabTextActive]}>Finalizados</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Torneos</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push(`/organizaciones/${activeOrg?.id}/torneos/create`)}
        >
          <Feather name="plus" size={18} color={COLORS.white} />
          <Text style={styles.newBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar torneos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
        {renderTabs()}
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
          <Skeleton width={150} height={20} style={{ marginBottom: 12, marginTop: 10 }} />
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.torneoCard, { paddingVertical: 12 }]}>
              <View style={styles.torneoLeft}>
                <Skeleton width={48} height={48} borderRadius={12} />
                <View style={styles.torneoInfo}>
                  <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                  <Skeleton width="40%" height={12} style={{ marginBottom: 6 }} />
                  <Skeleton width="30%" height={12} />
                </View>
              </View>
              <Skeleton width={20} height={20} borderRadius={10} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
          {filteredTorneos.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="award" size={48} color={COLORS.border} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Sin resultados' : (activeTab === 'en_curso' ? 'Sin torneos activos' : 'Sin torneos finalizados')}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Intenta con otro término de búsqueda.' : 'No hay torneos en esta categoría.'}
              </Text>
              {!searchQuery && activeTab === 'en_curso' && (
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => router.push(`/organizaciones/${activeOrg?.id}/torneos/create`)}
                >
                  <Feather name="plus" size={18} color={COLORS.white} />
                  <Text style={styles.createBtnText}>Crear Torneo</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            groupedTorneos.map(([temporada, items]) => (
              <View key={temporada} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>Temporada {temporada}</Text>
                {items.map((torneo: any) => (
                  <TouchableOpacity
                    key={torneo.id}
                    style={styles.torneoCard}
                    onPress={() => router.push(`/organizaciones/${activeOrg?.id}/torneos/${torneo.id}`)}
                  >
                    <View style={styles.torneoLeft}>
                      <View style={styles.torneoIcon}>
                        <Feather name="award" size={22} color={COLORS.primary} />
                      </View>
                      <View style={styles.torneoInfo}>
                        <Text style={styles.torneoName}>{torneo.nombre}</Text>
                        <Text style={styles.torneoMeta}>{torneo.deportes?.nombre} • {torneo.categoria_territorial}</Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  newBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  newBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.textDark },
  
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.primary },

  container: { padding: 16 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textLight, marginBottom: 24, textAlign: 'center' },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, gap: 8 },
  createBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },

  groupContainer: { marginBottom: 20 },
  groupTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textLight, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  torneoCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  torneoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 14 },
  torneoIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  torneoInfo: { flex: 1 },
  torneoName: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 3 },
  torneoMeta: { fontSize: 12, color: COLORS.textLight },
});
