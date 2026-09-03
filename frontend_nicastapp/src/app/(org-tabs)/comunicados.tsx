import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useOrgContext } from '../../context/OrgContext';
import { getComunicados } from '../../services/api';
import { Skeleton } from '../../components/SkeletonLoader';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export default function OrgComunicadosScreen() {
  const { activeOrg } = useOrgContext();
  const insets = useSafeAreaInsets();
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      if (!activeOrg?.id) return;
      setIsLoading(true);
      try {
        const data = await getComunicados(activeOrg.id);
        setComunicados(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeOrg?.id]));

  const renderComunicado = (com: any) => (
    <View key={com.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Feather name="message-circle" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardType}>{com.tipo_aviso}</Text>
          <Text style={styles.cardDate}>
            {com.fecha_publicacion ? new Date(com.fecha_publicacion).toLocaleDateString() : ''}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{com.titulo}</Text>
      <Text style={styles.cardContent}>{com.contenido}</Text>
      {com.torneos?.nombre && (
        <View style={styles.torneoBadge}>
          <Feather name="award" size={12} color={COLORS.primary} />
          <Text style={styles.torneoBadgeText}>{com.torneos.nombre}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comunicados</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push(`/organizaciones/${activeOrg?.id}/comunicados/create`)}
        >
          <Feather name="plus" size={18} color={COLORS.white} />
          <Text style={styles.newBtnText}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <Skeleton width={36} height={36} borderRadius={10} style={{ marginRight: 12 }} />
                <View style={styles.cardMeta}>
                  <Skeleton width={80} height={14} style={{ marginBottom: 4 }} />
                  <Skeleton width={60} height={12} />
                </View>
              </View>
              <Skeleton width="80%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
              <Skeleton width="90%" height={14} style={{ marginBottom: 12 }} />
              <Skeleton width={100} height={24} borderRadius={12} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 100 }]}>
          {comunicados.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="message-square" size={48} color={COLORS.border} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>Sin comunicados</Text>
              <Text style={styles.emptyText}>No hay avisos publicados aún.</Text>
            </View>
          ) : (
            comunicados.map(renderComunicado)
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
  container: { padding: 16 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textLight, marginBottom: 24 },

  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardMeta: { flex: 1 },
  cardType: { fontSize: 13, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  cardDate: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark, marginBottom: 8 },
  cardContent: { fontSize: 14, color: COLORS.textDark, lineHeight: 20 },
  torneoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginTop: 12, gap: 6 },
  torneoBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
});
