import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTorneos, getTorneoTablas } from '../../services/api';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export default function StandingsScreen() {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [selectedTorneo, setSelectedTorneo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        const data = await getTorneos();
        setTorneos(data);
        if (data.length > 0) {
          const tablas = await getTorneoTablas(data[0].id);
          setSelectedTorneo(tablas);
        }
      } catch (error) {
        console.error('Error in standings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTorneos();
  }, []);

  const renderTablas = () => {
    if (!selectedTorneo) {
      return (
        <View style={styles.emptyState}>
          <Feather name="bar-chart-2" size={48} color={COLORS.textLight} style={{ opacity: 0.5 }} />
          <Text style={styles.emptyStateText}>No hay datos estadísticos disponibles</Text>
        </View>
      );
    }

    const metricas = selectedTorneo.deportes?.metricas_catalogo || [];
    
    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.teamCol]}>EQUIPO</Text>
          <Text style={[styles.headerCell, styles.numCol]}>JJ</Text>
          <Text style={[styles.headerCell, styles.numCol]}>JG</Text>
          <Text style={[styles.headerCell, styles.numCol]}>JP</Text>
          {metricas.map((m: any) => (
            <Text key={m.id} style={[styles.headerCell, styles.numCol]}>{m.clave_metrica}</Text>
          ))}
        </View>

        <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>El motor EAV calculará las posiciones aquí próximamente...</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Posiciones y Estadísticas</Text>
        {selectedTorneo && (
          <Text style={styles.subtitle}>{selectedTorneo.nombre}</Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderTablas()}
          </ScrollView>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textDark },
  subtitle: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyStateText: { marginTop: 16, fontSize: 14, color: COLORS.textLight, textAlign: 'center' },
  tableContainer: { backgroundColor: COLORS.white, margin: 20, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerCell: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  teamCol: { width: 120, paddingLeft: 16 },
  numCol: { width: 45, textAlign: 'center' }
});
