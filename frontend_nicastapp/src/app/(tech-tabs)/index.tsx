import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../../services/api';

const COLORS = {
  primary: '#0F172A',
  secondary: '#334155',
  background: '#F8FAFC',
  white: '#FFFFFF',
  textDark: '#0F172A',
  textLight: '#64748B',
  border: '#E2E8F0',
  tech: '#9333EA',
  techLight: '#F3E8FF',
  success: '#10B981',
};

export default function TechDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [encuentros, setEncuentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const fetchEncuentros = async (userId: string) => {
    try {
      setLoading(true);
      const res = await apiCall(`/encuentros/mis-asignaciones/tecnico/${userId}`, 'GET');
      setEncuentros(res);
      // Cache data
      await AsyncStorage.setItem(`@tech_matches_${userId}`, JSON.stringify(res));
    } catch (error) {
      console.error('Error fetching tech encuentros, trying cache:', error);
      try {
        const cached = await AsyncStorage.getItem(`@tech_matches_${userId}`);
        if (cached) setEncuentros(JSON.parse(cached));
      } catch (e) {
        console.error('Error loading cache:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const userData = await AsyncStorage.getItem('@user');
          if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            fetchEncuentros(parsed.id);
          } else {
            setLoading(false);
          }
        } catch (e) {
          setLoading(false);
        }
      };
      loadUser();
    }, [])
  );

  const renderEncuentro = ({ item }: { item: any }) => {
    const fecha = new Date(item.fecha_hora);
    const dateStr = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Find local and visitante
    const local = item.competidores_encuentro[0]?.equipos?.nombre || 'Equipo Local';
    const visitante = item.competidores_encuentro[1]?.equipos?.nombre || 'Equipo Visitante';

    const isFinalizado = item.estado_encuentro === 'finalizado';
    const isPendingSync = item.is_pending_sync;

    return (
      <TouchableOpacity 
        style={[styles.card, (isFinalizado || isPendingSync) && styles.cardDisabled]}
        onPress={() => {
          if (!isFinalizado && !isPendingSync) {
            router.push(`/(tech-tabs)/encuentro/${item.id}`);
          } else if (isPendingSync) {
            Alert.alert('Pendiente de Sincronización', 'Este partido se guardó localmente y se enviará automáticamente cuando recuperes la conexión a internet.');
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportText}>{item.torneos?.nombre || 'Torneo'}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            isPendingSync ? { backgroundColor: '#DBEAFE' } :
            isFinalizado ? { backgroundColor: '#D1FAE5' } : { backgroundColor: '#FEF3C7' }
          ]}>
            <Text style={[
              styles.statusText, 
              isPendingSync ? { color: '#1D4ED8' } :
              isFinalizado ? { color: '#059669' } : { color: '#D97706' }
            ]}>
              {isPendingSync ? 'Pendiente Sincronización ⏳' : isFinalizado ? 'Finalizado' : 'Pendiente'}
            </Text>
          </View>
        </View>

        <View style={styles.matchup}>
          <Text style={styles.teamName} numberOfLines={1}>{local}</Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.teamName} numberOfLines={1}>{visitante}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Feather name="calendar" size={14} color={COLORS.textLight} />
            <Text style={styles.infoText}>{dateStr} • {timeStr}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={14} color={COLORS.textLight} />
            <Text style={styles.infoText}>{item.sede_instalacion}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mesa Técnica</Text>
          <Text style={styles.headerSubtitle}>Tus partidos asignados</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => setShowSwitcher(true)}>
          <Feather name="award" size={20} color={COLORS.tech} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.tech} />
        </View>
      ) : (
        <FlatList
          data={encuentros}
          keyExtractor={(item) => item.id}
          renderItem={renderEncuentro}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="calendar" size={32} color={COLORS.tech} />
              </View>
              <Text style={styles.emptyTitle}>Sin asignaciones</Text>
              <Text style={styles.emptyDesc}>No tienes partidos asignados por el momento.</Text>
            </View>
          }
        />
      )}

      {/* Account Switcher Modal (Bottom Sheet) */}
      <Modal
        visible={showSwitcher}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSwitcher(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSwitcher(false)}>
          <Pressable style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 24) }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Cambiar de cuenta</Text>
            
            <ScrollView style={styles.accountsList}>
              {/* Technical Account (Active) */}
              <TouchableOpacity style={[styles.accountItem, styles.accountItemActive]} disabled>
                <View style={[styles.accountAvatar, { backgroundColor: '#F3E8FF' }]}>
                  <Feather name="award" size={20} color="#9333EA" />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>Mesa Técnica</Text>
                  <Text style={styles.accountType}>Anotador / Juez</Text>
                </View>
                <Feather name="check-circle" size={24} color={COLORS.tech} />
              </TouchableOpacity>

              {/* Switch back to personal */}
              <TouchableOpacity 
                style={styles.accountItem} 
                onPress={() => {
                  setShowSwitcher(false);
                  router.push('/(tabs)/profile');
                }}
              >
                <View style={[styles.accountAvatar, { backgroundColor: '#F1F5F9' }]}>
                  <Feather name="user" size={20} color="#0F3D91" />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{user?.nombreCompleto || 'Mi Perfil Personal'}</Text>
                  <Text style={styles.accountType}>Cuenta de usuario</Text>
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border 
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textDark },
  headerSubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.techLight, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, gap: 16 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  cardDisabled: { opacity: 0.7 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sportBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  sportText: { fontSize: 12, fontWeight: '600', color: COLORS.secondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  matchup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  teamName: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textDark, textAlign: 'center' },
  vs: { fontSize: 14, fontWeight: '600', color: COLORS.textLight, marginHorizontal: 12 },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: COLORS.textLight },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.techLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', paddingHorizontal: 40 },
  
  // Bottom Sheet Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 16, textAlign: 'center' },
  accountsList: { marginBottom: 16 },
  accountItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  accountItemActive: { backgroundColor: '#F8FAFC', borderColor: COLORS.tech },
  accountAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.tech, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  accountInfo: { flex: 1, paddingRight: 8 },
  accountName: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 2 },
  accountType: { fontSize: 12, color: COLORS.textLight },
});
