import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiCall } from '../../../services/api';
import { syncService } from '../../../services/syncService';

const COLORS = {
  primary: '#0F172A',
  tech: '#9333EA',
  techLight: '#F3E8FF',
  background: '#F8FAFC',
  white: '#FFFFFF',
  textDark: '#0F172A',
  textLight: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
};

export default function ActaEncuentro() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [encuentro, setEncuentro] = useState<any>(null);
  const [metricas, setMetricas] = useState<any[]>([]);
  const [valores, setValores] = useState<Record<string, Record<number, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let match, resMetricas;
      try {
        // Try to fetch from API
        match = await apiCall(`/encuentros/${id}`);
        await AsyncStorage.setItem(`@match_${id}`, JSON.stringify(match));
        
        if (match.torneos?.deporte_id) {
          resMetricas = await apiCall(`/metricas/deporte/${match.torneos.deporte_id}`);
          await AsyncStorage.setItem(`@metrics_${match.torneos.deporte_id}`, JSON.stringify(resMetricas));
        }
      } catch (networkError) {
        console.log('Network error, attempting to load from cache');
        const cachedMatch = await AsyncStorage.getItem(`@match_${id}`);
        if (!cachedMatch) throw new Error('No hay datos cacheados para este partido');
        match = JSON.parse(cachedMatch);
        
        if (match.torneos?.deporte_id) {
          const cachedMetrics = await AsyncStorage.getItem(`@metrics_${match.torneos.deporte_id}`);
          if (cachedMetrics) resMetricas = JSON.parse(cachedMetrics);
          else resMetricas = [];
        }
      }

      setEncuentro(match);

      if (match.torneos?.deporte_id && resMetricas) {
        // Filter metrics that are "equipo" scope for MVP
        const equipMetrics = resMetricas.filter((m: any) => m.ambito === 'equipo');
        setMetricas(equipMetrics);
        
        // Initialize state structure
        const initVals: any = {};
        match.competidores_encuentro.forEach((comp: any) => {
          initVals[comp.id] = {};
          equipMetrics.forEach((m: any) => {
            initVals[comp.id][m.id] = '0';
          });
        });
        setValores(initVals);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del encuentro (Revisa tu conexión o caché)');
    } finally {
      setLoading(false);
    }
  };

  const handleValChange = (competidorId: string, metricaId: number, val: string) => {
    setValores(prev => ({
      ...prev,
      [competidorId]: {
        ...prev[competidorId],
        [metricaId]: val
      }
    }));
  };

  const handleFinalizar = async () => {
    Alert.alert(
      'Finalizar Partido',
      '¿Estás seguro que deseas guardar los resultados finales? El partido se marcará como finalizado y no podrás editarlo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Finalizar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              
              // Prepare metrics array
              const metricasPayload: any[] = [];
              Object.keys(valores).forEach(compId => {
                Object.keys(valores[compId]).forEach(metId => {
                  metricasPayload.push({
                    competidor_encuentro_id: compId,
                    metrica_id: parseInt(metId, 10),
                    valor: parseFloat(valores[compId][parseInt(metId, 10)]) || 0
                  });
                });
              });

              const payload = {
                metricas: metricasPayload,
                nomina: []
              };

              const netInfo = await NetInfo.fetch();
              if (netInfo.isConnected) {
                await apiCall(`/encuentros/${id}/finalizar`, 'POST', payload);
                Alert.alert('Éxito', 'Partido finalizado correctamente', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              } else {
                const userId = await AsyncStorage.getItem('@user_id');
                await syncService.enqueueRequest(`/encuentros/${id}/finalizar`, 'POST', payload);
                // Mark locally as pending
                const cachedMatches = await AsyncStorage.getItem(`@tech_matches_${userId}`);
                if (cachedMatches) {
                   const matches = JSON.parse(cachedMatches);
                   const idx = matches.findIndex((m: any) => m.id === id);
                   if (idx !== -1) {
                     matches[idx].is_pending_sync = true;
                     await AsyncStorage.setItem(`@tech_matches_${userId}`, JSON.stringify(matches));
                   }
                }
                Alert.alert('Sin Conexión', 'El partido se guardó localmente. Se enviará cuando recuperes conexión.', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'No se pudo guardar el encuentro');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  if (loading || !encuentro) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.tech} />
      </View>
    );
  }

  const local = encuentro.competidores_encuentro[0];
  const visitante = encuentro.competidores_encuentro[1];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acta de Encuentro</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoBox}>
          <Text style={styles.torneoText}>{encuentro.torneos.nombre}</Text>
          <Text style={styles.dateText}>{new Date(encuentro.fecha_hora).toLocaleString('es-ES')}</Text>
        </View>

        <View style={styles.matchup}>
          <Text style={styles.teamName}>{local?.equipos?.nombre || 'Local'}</Text>
          <Text style={styles.vs}>VS</Text>
          <Text style={styles.teamName}>{visitante?.equipos?.nombre || 'Visitante'}</Text>
        </View>

        {metricas.length === 0 ? (
          <View style={styles.emptyMetrics}>
            <Feather name="alert-circle" size={24} color={COLORS.textLight} />
            <Text style={styles.emptyMetricsText}>
              No hay métricas configuradas para este deporte.
            </Text>
          </View>
        ) : (
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Resultados Finales</Text>
            
            {metricas.map((m) => (
              <View key={m.id} style={styles.metricRow}>
                <View style={styles.metricInputBox}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={valores[local?.id]?.[m.id]?.toString()}
                    onChangeText={(val) => handleValChange(local.id, m.id, val)}
                  />
                </View>
                <View style={styles.metricLabelBox}>
                  <Text style={styles.metricLabel}>{m.nombre_visible}</Text>
                </View>
                <View style={styles.metricInputBox}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={valores[visitante?.id]?.[m.id]?.toString()}
                    onChangeText={(val) => handleValChange(visitante.id, m.id, val)}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
          onPress={handleFinalizar}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Finalizar Partido</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border 
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  container: { padding: 20 },
  infoBox: { alignItems: 'center', marginBottom: 24 },
  torneoText: { fontSize: 16, fontWeight: '600', color: COLORS.tech, marginBottom: 4, textAlign: 'center' },
  dateText: { fontSize: 14, color: COLORS.textLight },
  matchup: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: COLORS.white, padding: 20, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  teamName: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textDark, textAlign: 'center' },
  vs: { fontSize: 14, fontWeight: '600', color: COLORS.textLight, marginHorizontal: 16 },
  metricsContainer: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 16, textAlign: 'center' },
  metricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  metricInputBox: { flex: 1, alignItems: 'center' },
  metricLabelBox: { flex: 1.5, alignItems: 'center' },
  metricLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, textAlign: 'center' },
  input: { 
    width: 60, height: 44, backgroundColor: COLORS.background, 
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
    textAlign: 'center', fontSize: 18, fontWeight: '600', color: COLORS.textDark 
  },
  emptyMetrics: { alignItems: 'center', marginTop: 40 },
  emptyMetricsText: { fontSize: 14, color: COLORS.textLight, marginTop: 12, textAlign: 'center' },
  footer: { padding: 20, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.tech, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '600' }
});
