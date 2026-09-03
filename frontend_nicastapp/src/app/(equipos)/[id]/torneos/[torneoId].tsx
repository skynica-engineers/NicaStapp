import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTorneoTablas, getEquipoRoster, getEquipoById } from '../../../../services/api';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#3B82F6',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444'
};

export default function EquipoTorneoDetalle() {
  const { id, torneoId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  
  const [torneo, setTorneo] = useState<any>(null);
  const [equipo, setEquipo] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [encuentrosTorneo, setEncuentrosTorneo] = useState<any[]>([]);
  
  const [tab, setTab] = useState<'calendario' | 'posiciones' | 'rendimiento'>('calendario');

  useEffect(() => {
    fetchData();
  }, [id, torneoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tData, eqData, rData] = await Promise.all([
        getTorneoTablas(torneoId as string),
        getEquipoById(id as string),
        getEquipoRoster(id as string)
      ]);
      setTorneo(tData);
      setEquipo(eqData);
      setRoster(rData);
      setEncuentrosTorneo(tData.encuentros || []);
    } catch (error) {
      console.error('Error fetching data for torneo detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- CALENDARIO LOGIC ---
  const misEncuentros = encuentrosTorneo.filter(enc => 
    enc.competidores_encuentro.some((c: any) => c.equipo_id === id)
  );

  const renderCalendario = () => {
    if (misEncuentros.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Feather name="calendar" size={40} color={COLORS.textLight} />
          <Text style={styles.emptyStateText}>No tienes encuentros programados en este torneo.</Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {misEncuentros.map(enc => {
          const eqA = enc.competidores_encuentro.find((c: any) => c.rol_posicion_etiqueta === 'Equipo A') || enc.competidores_encuentro[0];
          const eqB = enc.competidores_encuentro.find((c: any) => c.rol_posicion_etiqueta === 'Equipo B') || enc.competidores_encuentro[1];

          return (
            <View key={enc.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{enc.fecha_hora || 'Fecha por definir'}</Text>
                <View style={[styles.statusBadge, enc.estado === 'finalizado' ? styles.statusFinalizado : styles.statusPendiente]}>
                  <Text style={styles.statusText}>{enc.estado}</Text>
                </View>
              </View>
              <View style={styles.vsContainer}>
                <Text style={styles.teamName}>{eqA?.equipos?.nombre || 'TBD'}</Text>
                <Text style={styles.vsText}>VS</Text>
                <Text style={styles.teamName}>{eqB?.equipos?.nombre || 'TBD'}</Text>
              </View>
              {enc.sede_instalacion && (
                <Text style={styles.sedeText}><Feather name="map-pin" size={12}/> {enc.sede_instalacion}</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // --- POSICIONES LOGIC ---
  const renderPosiciones = () => {
    // Calculo basico de JJ, JG, JP basado en encuentros (global del torneo)
    const standingsMap: any = {};

    encuentrosTorneo.filter(e => e.estado === 'finalizado').forEach(enc => {
      const eqA = enc.competidores_encuentro.find((c: any) => c.rol_posicion_etiqueta === 'Equipo A') || enc.competidores_encuentro[0];
      const eqB = enc.competidores_encuentro.find((c: any) => c.rol_posicion_etiqueta === 'Equipo B') || enc.competidores_encuentro[1];

      if (!eqA || !eqB) return;

      const idA = eqA.equipo_id;
      const idB = eqB.equipo_id;

      if (!standingsMap[idA]) standingsMap[idA] = { nombre: eqA.equipos?.nombre, jj: 0, jg: 0, jp: 0 };
      if (!standingsMap[idB]) standingsMap[idB] = { nombre: eqB.equipos?.nombre, jj: 0, jg: 0, jp: 0 };

      standingsMap[idA].jj += 1;
      standingsMap[idB].jj += 1;

      if (eqA.resultado_final === 'victoria') standingsMap[idA].jg += 1;
      if (eqB.resultado_final === 'victoria') standingsMap[idB].jg += 1;
      if (eqA.resultado_final === 'derrota') standingsMap[idA].jp += 1;
      if (eqB.resultado_final === 'derrota') standingsMap[idB].jp += 1;
    });

    const standingsArr = Object.values(standingsMap).sort((a: any, b: any) => b.jg - a.jg);

    return (
      <View style={styles.listContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.teamCol]}>EQUIPO</Text>
          <Text style={[styles.headerCell, styles.numCol]}>JJ</Text>
          <Text style={[styles.headerCell, styles.numCol]}>JG</Text>
          <Text style={[styles.headerCell, styles.numCol]}>JP</Text>
        </View>

        {standingsArr.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: COLORS.white, marginTop: 0 }]}>
             <Text style={styles.emptyStateText}>No hay partidos finalizados aún en el torneo.</Text>
          </View>
        ) : (
          standingsArr.map((st: any, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.rowCell, styles.teamCol]} numberOfLines={1}>{st.nombre}</Text>
              <Text style={[styles.rowCell, styles.numCol]}>{st.jj}</Text>
              <Text style={[styles.rowCell, styles.numCol]}>{st.jg}</Text>
              <Text style={[styles.rowCell, styles.numCol]}>{st.jp}</Text>
            </View>
          ))
        )}
      </View>
    );
  };

  // --- RENDIMIENTO LOGIC ---
  const renderRendimiento = () => {
    const perfilIds = roster.filter(r => r.perfil_id).map(r => r.perfil_id);
    const rendimientoAtletas: any = {};
    
    roster.forEach(r => {
      rendimientoAtletas[r.nombre_completo] = {};
    });

    encuentrosTorneo.forEach(enc => {
      if (enc.valores_metricas_encuentro) {
        enc.valores_metricas_encuentro.forEach((val: any) => {
          if (val.perfil_id && perfilIds.includes(val.perfil_id)) {
            const r = roster.find(r => r.perfil_id === val.perfil_id);
            if (r) {
              const metricaNombre = val.metrica?.clave_metrica || 'Dato';
              if (!rendimientoAtletas[r.nombre_completo][metricaNombre]) {
                rendimientoAtletas[r.nombre_completo][metricaNombre] = 0;
              }
              rendimientoAtletas[r.nombre_completo][metricaNombre] += Number(val.valor) || 0;
            }
          }
        });
      }
    });

    return (
      <View style={styles.listContainer}>
        {roster.map(r => {
          const stats = rendimientoAtletas[r.nombre_completo] || {};
          const keys = Object.keys(stats);
          return (
            <View key={r.id} style={styles.card}>
              <Text style={styles.playerName}>{r.nombre_completo}</Text>
              {keys.length === 0 ? (
                <Text style={styles.emptyStateText}>Sin estadísticas registradas.</Text>
              ) : (
                <View style={styles.statsRow}>
                  {keys.map(k => (
                    <View key={k} style={styles.statBox}>
                      <Text style={styles.statVal}>{stats[k]}</Text>
                      <Text style={styles.statLbl}>{k}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{torneo?.nombre || 'Detalle del Torneo'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, tab === 'calendario' && styles.tabActive]} onPress={() => setTab('calendario')}>
              <Text style={[styles.tabText, tab === 'calendario' && styles.tabTextActive]}>Calendario</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'posiciones' && styles.tabActive]} onPress={() => setTab('posiciones')}>
              <Text style={[styles.tabText, tab === 'posiciones' && styles.tabTextActive]}>Posiciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'rendimiento' && styles.tabActive]} onPress={() => setTab('rendimiento')}>
              <Text style={[styles.tabText, tab === 'rendimiento' && styles.tabTextActive]}>Rendimiento</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {tab === 'calendario' && renderCalendario()}
            {tab === 'posiciones' && renderPosiciones()}
            {tab === 'rendimiento' && renderRendimiento()}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
  backBtn: { padding: 4 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  tabsContainer: { flexDirection: 'row', margin: 16, backgroundColor: '#F1F5F9', borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: {width: 0, height: 1}, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.primary },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  listContainer: { marginTop: 8 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { marginTop: 12, color: COLORS.textLight, textAlign: 'center' },
  
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 12, color: COLORS.textLight, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusPendiente: { backgroundColor: '#FEF3C7' },
  statusFinalizado: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  vsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  teamName: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  vsText: { fontSize: 14, color: COLORS.textLight, marginHorizontal: 10 },
  sedeText: { fontSize: 12, color: COLORS.textLight, marginTop: 8, textAlign: 'center' },

  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', paddingVertical: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 12 },
  tableRow: { flexDirection: 'row', backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerCell: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  rowCell: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  teamCol: { flex: 1 },
  numCol: { width: 40, textAlign: 'center' },

  playerName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  statBox: { backgroundColor: '#F1F5F9', borderRadius: 8, padding: 8, alignItems: 'center', marginRight: 8, marginBottom: 8, minWidth: 60 },
  statVal: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  statLbl: { fontSize: 10, color: COLORS.textLight, marginTop: 2, textTransform: 'uppercase' },
});
