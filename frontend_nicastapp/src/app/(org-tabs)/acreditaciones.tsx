import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useOrgContext } from '../../context/OrgContext';
import { apiCall } from '../../services/api';
import { useFocusEffect } from 'expo-router';
import { Skeleton } from '../../components/SkeletonLoader';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

export default function AcreditacionesScreen() {
  const insets = useSafeAreaInsets();
  const { activeOrg } = useOrgContext();
  
  const [acreditaciones, setAcreditaciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadAcreditaciones = useCallback(async () => {
    if (!activeOrg?.id) return;
    setIsLoading(true);
    try {
      const data = await apiCall(`/organizaciones/${activeOrg.id}/acreditaciones`);
      setAcreditaciones(data);
    } catch (error) {
      console.error('Error fetching acreditaciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrg?.id]);

  useFocusEffect(useCallback(() => { loadAcreditaciones(); }, [loadAcreditaciones]));

  const handleDecision = (id: string, estado: string, nombre: string) => {
    Alert.alert(
      estado === 'aprobado' ? 'Aprobar Solicitud' : 'Rechazar Solicitud',
      `¿Deseas ${estado === 'aprobado' ? 'aprobar' : 'rechazar'} a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: estado === 'aprobado' ? '✓ Aprobar' : '✕ Rechazar', 
          style: estado === 'aprobado' ? 'default' : 'destructive',
          onPress: async () => {
            setProcessingId(id);
            try {
              await apiCall(`/organizaciones/acreditaciones/${id}/estado`, 'PUT', { estado_aprobacion: estado });
              setAcreditaciones(prev => prev.map(a => a.id === id ? { ...a, estado_aprobacion: estado } : a));
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar el estado.');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const pendientes = acreditaciones.filter(a => a.estado_aprobacion === 'pendiente');
  const aprobados = acreditaciones.filter(a => a.estado_aprobacion === 'aprobado');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personal Técnico</Text>
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <Skeleton width={150} height={20} style={{ marginBottom: 12 }} />
          {[1,2,3].map(i => (
            <View key={i} style={styles.card}>
              <Skeleton width={42} height={42} borderRadius={21} />
              <View style={styles.cardInfo}>
                <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Personal Técnico</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.description}>
          Administra las solicitudes de Jueces y Anotadores que desean aval de tu organización.
        </Text>

        <View style={styles.sectionHeader}>
          <View style={[styles.dot, { backgroundColor: COLORS.warning }]} />
          <Text style={styles.sectionTitle}>Pendientes ({pendientes.length})</Text>
        </View>
        
        {pendientes.length === 0 ? (
          <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
        ) : (
          pendientes.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.avatar}>
                <Feather name="user" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.perfiles?.nombre_completo || item.perfiles?.nombreCompleto || 'Usuario Desconocido'}</Text>
                <Text style={styles.cardSub}>Rol: {item.rol_acreditacion} • {item.deportes?.nombre}</Text>
              </View>
              {processingId === item.id ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleDecision(item.id, 'rechazado', item.perfiles?.nombre_completo || item.perfiles?.nombreCompleto)}>
                    <Feather name="x" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleDecision(item.id, 'aprobado', item.perfiles?.nombre_completo || item.perfiles?.nombreCompleto)}>
                    <Feather name="check" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}

        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.sectionTitle}>Aprobados ({aprobados.length})</Text>
        </View>

        {aprobados.length === 0 ? (
          <Text style={styles.emptyText}>No hay personal aprobado aún</Text>
        ) : (
          aprobados.map(item => (
            <View key={item.id} style={[styles.card, { borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' }]}>
              <View style={[styles.avatar, { backgroundColor: '#D1FAE5' }]}>
                <Feather name="check" size={20} color={COLORS.success} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.perfiles?.nombre_completo || item.perfiles?.nombreCompleto || 'Usuario Desconocido'}</Text>
                <Text style={styles.cardSub}>Rol: {item.rol_acreditacion} • {item.deportes?.nombre}</Text>
              </View>
              {processingId === item.id ? (
                <ActivityIndicator color={COLORS.success} />
              ) : (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} 
                  onPress={() => {
                    Alert.alert(
                      'Revocar Acreditación',
                      `¿Estás seguro que deseas eliminar a ${item.perfiles?.nombre_completo || item.perfiles?.nombreCompleto} de tus acreditados?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { 
                          text: 'Eliminar', 
                          style: 'destructive',
                          onPress: async () => {
                            setProcessingId(item.id);
                            try {
                              await apiCall(`/organizaciones/acreditaciones/${item.id}/estado`, 'PUT', { estado_aprobacion: 'revocado' });
                              setAcreditaciones(prev => prev.map(a => a.id === item.id ? { ...a, estado_aprobacion: 'revocado' } : a));
                            } catch (error) {
                              Alert.alert('Error', 'No se pudo revocar la acreditación.');
                            } finally {
                              setProcessingId(null);
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Feather name="trash-2" size={18} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  container: { padding: 16, paddingBottom: 100 },
  description: { fontSize: 14, color: COLORS.textLight, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyText: { fontSize: 14, color: COLORS.textLight, fontStyle: 'italic', marginBottom: 12 },
  
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  cardSub: { fontSize: 12, color: COLORS.textLight },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { backgroundColor: '#FEE2E2' },
  approveBtn: { backgroundColor: COLORS.success },
});
