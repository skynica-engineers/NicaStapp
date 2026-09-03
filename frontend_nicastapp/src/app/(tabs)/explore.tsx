import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getTorneos } from '../../services/api';
import { Skeleton } from '../../components/SkeletonLoader';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [torneos, setTorneos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const data = await getTorneos();
        setTorneos(data);
      } catch (error) {
        console.error('Error in explore:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExploreData();
  }, []);

  const filteredTorneos = torneos.filter(t => 
    t.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar Torneos</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar torneos, ligas..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.content}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardInfo}>
                <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="30%" height={12} />
              </View>
              <Skeleton width={24} height={24} borderRadius={12} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {filteredTorneos.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="folder-minus" size={48} color={COLORS.textLight} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyStateText}>No se encontraron torneos</Text>
            </View>
          ) : (
            filteredTorneos.map(torneo => (
              <TouchableOpacity key={torneo.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{torneo.nombre}</Text>
                  <Text style={styles.cardSubtitle}>
                    {torneo.deportes?.nombre} • {torneo.categoria_territorial || 'General'}
                  </Text>
                  <Text style={styles.cardTemporada}>Temporada {torneo.temporada}</Text>
                </View>
                <Feather name="chevron-right" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textDark },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: COLORS.textDark },
  content: { padding: 20, gap: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  cardTemporada: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { marginTop: 16, fontSize: 16, color: COLORS.textLight },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
