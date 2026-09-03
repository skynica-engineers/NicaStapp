import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getOrganizacionById } from '../../../services/api';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
};

export default function OrganizacionDashboard() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [organizacion, setOrganizacion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      if (id) {
        const data = await getOrganizacionById(id as string);
        setOrganizacion(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!organizacion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Organización no encontrada.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel de Control</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Premium Org Hero Card */}
        <LinearGradient 
          colors={['#0F3D91', '#2862CD']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroIconWrap}>
              <Feather name="shield" size={28} color={COLORS.primary} />
            </View>
          </View>
          
          <Text style={styles.heroTitle}>{organizacion.nombre}</Text>
          
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Feather name="briefcase" size={12} color={COLORS.primary} />
              <Text style={styles.badgeText}>{organizacion.tipo_institucion}</Text>
            </View>
            {organizacion.municipios && (
              <View style={styles.badge}>
                <Feather name="map-pin" size={12} color={COLORS.primary} />
                <Text style={styles.badgeText}>{organizacion.municipios.nombre}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Torneos Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Torneos y Ligas</Text>
        </View>

        {organizacion.torneos && organizacion.torneos.length > 0 ? (
          organizacion.torneos.map((torneo: any) => (
            <TouchableOpacity 
              key={torneo.id} 
              style={styles.torneoCard}
              onPress={() => router.push(`/organizaciones/${id}/torneos/${torneo.id}`)}
            >
              <View style={styles.torneoIcon}>
                <Feather name="award" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.torneoInfo}>
                <Text style={styles.torneoName}>{torneo.nombre}</Text>
                <Text style={styles.torneoDetails}>
                  {torneo.deportes?.nombre} • {torneo.categoria_territorial} • {torneo.temporada}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={40} color={COLORS.border} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No hay torneos registrados.</Text>
          </View>
        )}

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 20 }]} 
        onPress={() => router.push(`/organizaciones/${id}/torneos/create`)}
      >
        <Feather name="plus" size={24} color={COLORS.white} />
        <Text style={styles.fabText}>Crear Torneo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, flex: 1, textAlign: 'center', marginHorizontal: 12 },
  container: { padding: 20, paddingBottom: 100 },
  
  heroCard: { padding: 20, borderRadius: 20, marginBottom: 28, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heroIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: COLORS.white, marginBottom: 16, letterSpacing: -0.5 },
  badgesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  badgeText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  badgeCount: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeCountText: { color: COLORS.error, fontSize: 12, fontWeight: '700' },
  
  torneoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  torneoIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  torneoInfo: { flex: 1 },
  torneoName: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  torneoDetails: { fontSize: 13, color: COLORS.textLight },

  emptyState: { alignItems: 'center', padding: 32, backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  emptyText: { color: COLORS.textLight, fontSize: 14, fontStyle: 'italic' },
  fab: { position: 'absolute', right: 20, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  fabText: { color: COLORS.white, fontWeight: '700', fontSize: 16, marginLeft: 8 },
});
