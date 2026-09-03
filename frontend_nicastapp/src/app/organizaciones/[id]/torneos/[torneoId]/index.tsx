import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Animated
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getTorneoById,
  getSolicitudesAcreditacionTorneo,
  updateEstadoAcreditacionTorneo,
  getEquiposTorneo,
  updateEstadoInscripcionEquipo,
  getComunicados,
  getEncuentrosTorneo,
  updateEstadoTorneo,
} from '../../../../../services/api';
import { Skeleton } from '../../../../../components/SkeletonLoader';

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

type Tab = 'equipos' | 'anotadores' | 'jueces' | 'jornadas' | 'comunicados';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'equipos', label: 'Equipos', icon: 'shield' },
  { key: 'anotadores', label: 'Anotadores', icon: 'clipboard' },
  { key: 'jueces', label: 'Jueces', icon: 'flag' },
  { key: 'jornadas', label: 'Jornadas', icon: 'calendar' },
  { key: 'comunicados', label: 'Comunicados', icon: 'message-square' },
];

export default function TorneoDashboard() {
  const { id: orgId, torneoId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<Tab>('equipos');
  const [torneo, setTorneo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to active tab when it changes or after data finishes loading
  useEffect(() => {
    if (!isLoading) {
      const index = TABS.findIndex(t => t.key === activeTab);
      if (index !== -1) {
        setTimeout(() => {
          scrollRef.current?.scrollTo({ x: Math.max(0, index * 120 - 130), animated: true });
        }, 150);
      }
    }
  }, [activeTab, isLoading]);

  const handleTabPress = (tabKey: Tab, index: number) => {
    setActiveTab(tabKey);
  };

  // Tab data
  const [equiposPendientes, setEquiposPendientes] = useState<any[]>([]);
  const [equiposActivos, setEquiposActivos] = useState<any[]>([]);
  const [anotadoresPendientes, setAnotadoresPendientes] = useState<any[]>([]);
  const [anotadoresActivos, setAnotadoresActivos] = useState<any[]>([]);
  const [juecesPendientes, setJuecesPendientes] = useState<any[]>([]);
  const [juecesActivos, setJuecesActivos] = useState<any[]>([]);
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [encuentros, setEncuentros] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!torneoId) return;
    setIsLoading(true);
    try {
      const [t, eqPend, eqActivos, anoPend, anoActivos, juePend, jueActivos, coms, encs] = await Promise.all([
        getTorneoById(torneoId as string),
        getEquiposTorneo(torneoId as string, 'pendiente'),
        getEquiposTorneo(torneoId as string, 'aprobado'),
        getSolicitudesAcreditacionTorneo(torneoId as string, 'anotador', 'pendiente'),
        getSolicitudesAcreditacionTorneo(torneoId as string, 'anotador', 'aprobado'),
        getSolicitudesAcreditacionTorneo(torneoId as string, 'juez', 'pendiente'),
        getSolicitudesAcreditacionTorneo(torneoId as string, 'juez', 'aprobado'),
        getComunicados(orgId as string, torneoId as string),
        getEncuentrosTorneo(torneoId as string),
      ]);
      setTorneo(t);
      setEquiposPendientes(eqPend);
      setEquiposActivos(eqActivos);
      setAnotadoresPendientes(anoPend);
      setAnotadoresActivos(anoActivos);
      setJuecesPendientes(juePend);
      setJuecesActivos(jueActivos);
      setComunicados(coms);
      setEncuentros(encs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [torneoId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleFinalizarTorneo = () => {
    Alert.alert(
      'Finalizar Torneo',
      '¿Estás seguro de que deseas finalizar este torneo? Esta acción indicará que el torneo ha concluido y lo moverá al historial de finalizados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, finalizar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await updateEstadoTorneo(torneoId as string, 'finalizado');
              Alert.alert('Éxito', 'El torneo ha finalizado correctamente.');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'No se pudo finalizar el torneo.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const confirmDecisionEquipo = (inscripcionId: string, estado: string, nombre: string) => {
    Alert.alert(
      estado === 'aprobado' ? 'Aprobar equipo' : 'Rechazar equipo',
      `¿Deseas ${estado === 'aprobado' ? 'aprobar' : 'rechazar'} la inscripción de "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: estado === 'aprobado' ? '✓ Aprobar' : '✕ Rechazar',
          style: estado === 'aprobado' ? 'default' : 'destructive',
          onPress: async () => {
            setProcessingId(inscripcionId);
            try {
              await updateEstadoInscripcionEquipo(torneoId as string, inscripcionId, estado);
              if (estado === 'aprobado') {
                const item = equiposPendientes.find(e => e.id === inscripcionId);
                setEquiposPendientes(prev => prev.filter(e => e.id !== inscripcionId));
                if (item) setEquiposActivos(prev => [{ ...item, estado_inscripcion: 'aprobado' }, ...prev]);
              } else {
                setEquiposPendientes(prev => prev.filter(e => e.id !== inscripcionId));
              }
            } catch { Alert.alert('Error', 'No se pudo actualizar el equipo.'); }
            finally { setProcessingId(null); }
          }
        }
      ]
    );
  };

  const confirmDecisionAcreditacion = (
    acreditacionId: string, estado: string, nombre: string,
    tipo: 'anotador' | 'juez'
  ) => {
    const setP = tipo === 'anotador' ? setAnotadoresPendientes : setJuecesPendientes;
    const setA = tipo === 'anotador' ? setAnotadoresActivos : setJuecesActivos;
    const pending = tipo === 'anotador' ? anotadoresPendientes : juecesPendientes;

    Alert.alert(
      estado === 'aprobado' ? `Aprobar ${tipo}` : `Rechazar ${tipo}`,
      `¿Deseas ${estado === 'aprobado' ? 'aprobar' : 'rechazar'} a "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: estado === 'aprobado' ? '✓ Aprobar' : '✕ Rechazar',
          style: estado === 'aprobado' ? 'default' : 'destructive',
          onPress: async () => {
            setProcessingId(acreditacionId);
            try {
              await updateEstadoAcreditacionTorneo(torneoId as string, acreditacionId, estado);
              if (estado === 'aprobado') {
                const item = pending.find(a => a.id === acreditacionId);
                setP(prev => prev.filter(a => a.id !== acreditacionId));
                if (item) setA(prev => [{ ...item, estado_aprobacion: 'aprobado' }, ...prev]);
              } else {
                setP(prev => prev.filter(a => a.id !== acreditacionId));
              }
            } catch { Alert.alert('Error', 'No se pudo actualizar la solicitud.'); }
            finally { setProcessingId(null); }
          }
        }
      ]
    );
  };

  const renderApproveRejectButtons = (id: string, onApprove: () => void, onReject: () => void) => {
    if (processingId === id) return <ActivityIndicator color={COLORS.primary} />;
    return (
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
          <Feather name="x" size={18} color={COLORS.error} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={onApprove}>
          <Feather name="check" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatusBadge = (label: string, color: string, bg: string) => (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
    </View>
  );

  const renderEquiposTab = () => (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 100 }]}>
      {/* Pendientes */}
      {equiposPendientes.length > 0 && (
        <>
          <View style={styles.subSectionHeader}>
            <View style={[styles.dot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.subSectionTitle}>Pendientes ({equiposPendientes.length})</Text>
          </View>
          {equiposPendientes.map(insc => (
            <View key={insc.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Feather name="shield" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{insc.equipos?.nombre ?? 'Sin nombre'}</Text>
                <Text style={styles.cardSub}>{insc.equipos?.comunidades?.nombre ?? ''}</Text>
              </View>
              {renderApproveRejectButtons(
                insc.id,
                () => confirmDecisionEquipo(insc.id, 'aprobado', insc.equipos?.nombre ?? ''),
                () => confirmDecisionEquipo(insc.id, 'rechazado', insc.equipos?.nombre ?? '')
              )}
            </View>
          ))}
        </>
      )}
      {/* Activos */}
      {equiposActivos.length > 0 && (
        <>
          <View style={styles.subSectionHeader}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.subSectionTitle}>Convocados ({equiposActivos.length})</Text>
          </View>
          {equiposActivos.map(insc => (
            <View key={insc.id} style={[styles.card, styles.cardActive]}>
              <View style={[styles.cardIcon, { backgroundColor: '#D1FAE5' }]}>
                <Feather name="shield" size={22} color={COLORS.success} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{insc.equipos?.nombre ?? 'Sin nombre'}</Text>
                <Text style={styles.cardSub}>{insc.equipos?.comunidades?.nombre ?? ''}</Text>
              </View>
              {renderStatusBadge('Activo', COLORS.success, '#D1FAE5')}
            </View>
          ))}
        </>
      )}
      {equiposPendientes.length === 0 && equiposActivos.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="shield" size={36} color={COLORS.border} />
          <Text style={styles.emptyText}>Sin equipos inscritos</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderPersonalTab = (
    tipo: 'anotador' | 'juez',
    pendientes: any[],
    activos: any[]
  ) => (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 100 }]}>
      <TouchableOpacity
        style={styles.newComunicadoBtn}
        onPress={() => router.push(`/organizaciones/${orgId}/torneos/${torneoId}/asignar-personal?rol=${tipo}`)}
      >
        <Feather name="user-plus" size={20} color={COLORS.primary} />
        <Text style={styles.newComunicadoText}>Asignar {tipo === 'anotador' ? 'Anotador' : 'Juez'}</Text>
      </TouchableOpacity>

      {pendientes.length > 0 && (
        <>
          <View style={styles.subSectionHeader}>
            <View style={[styles.dot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.subSectionTitle}>Pendientes ({pendientes.length})</Text>
          </View>
          {pendientes.map(sol => (
            <View key={sol.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Feather name={tipo === 'anotador' ? 'clipboard' : 'flag'} size={22} color={tipo === 'anotador' ? '#3B82F6' : '#8B5CF6'} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{sol.perfiles?.nombreCompleto ?? 'Sin nombre'}</Text>
                <Text style={styles.cardSub}>{sol.deportes?.nombre ?? ''}</Text>
              </View>
              {renderApproveRejectButtons(
                sol.id,
                () => confirmDecisionAcreditacion(sol.id, 'aprobado', sol.perfiles?.nombreCompleto ?? '', tipo),
                () => confirmDecisionAcreditacion(sol.id, 'rechazado', sol.perfiles?.nombreCompleto ?? '', tipo)
              )}
            </View>
          ))}
        </>
      )}
      {activos.length > 0 && (
        <>
          <View style={styles.subSectionHeader}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.subSectionTitle}>Acreditados ({activos.length})</Text>
          </View>
          {activos.map(sol => (
            <View key={sol.id} style={[styles.card, styles.cardActive]}>
              <View style={[styles.cardIcon, { backgroundColor: '#D1FAE5' }]}>
                <Feather name={tipo === 'anotador' ? 'clipboard' : 'flag'} size={22} color={COLORS.success} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{sol.perfiles?.nombreCompleto ?? 'Sin nombre'}</Text>
                <Text style={styles.cardSub}>{sol.deportes?.nombre ?? ''}</Text>
              </View>
              {renderStatusBadge('Acreditado', COLORS.success, '#D1FAE5')}
            </View>
          ))}
        </>
      )}
      {pendientes.length === 0 && activos.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name={tipo === 'anotador' ? 'clipboard' : 'flag'} size={36} color={COLORS.border} />
          <Text style={styles.emptyText}>Sin {tipo === 'anotador' ? 'anotadores' : 'jueces'} registrados</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderComunicadosTab = () => (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 100 }]}>
      <TouchableOpacity
        style={styles.newComunicadoBtn}
        onPress={() => router.push(`/organizaciones/${orgId}/comunicados/create?torneoId=${torneoId}`)}
      >
        <Feather name="plus-circle" size={20} color={COLORS.primary} />
        <Text style={styles.newComunicadoText}>Publicar Nuevo Comunicado</Text>
      </TouchableOpacity>
      
      {comunicados.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="message-square" size={36} color={COLORS.border} />
          <Text style={styles.emptyText}>No hay avisos para este torneo</Text>
        </View>
      ) : (
        comunicados.map(com => (
          <View key={com.id} style={styles.comunicadoCard}>
            <View style={styles.comunicadoHeader}>
              <Text style={styles.comunicadoType}>{com.tipo_aviso}</Text>
              <Text style={styles.comunicadoDate}>
                {com.fecha_publicacion ? new Date(com.fecha_publicacion).toLocaleDateString() : ''}
              </Text>
            </View>
            <Text style={styles.comunicadoTitle}>{com.titulo}</Text>
            <Text style={styles.comunicadoContent}>{com.contenido}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderJornadasTab = () => (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: insets.bottom + 100 }]}>
      <TouchableOpacity
        style={styles.newComunicadoBtn}
        onPress={() => router.push(`/organizaciones/${orgId}/torneos/${torneoId}/programar-encuentro`)}
      >
        <Feather name="plus-circle" size={20} color={COLORS.primary} />
        <Text style={styles.newComunicadoText}>Programar Encuentro</Text>
      </TouchableOpacity>
      
      {encuentros.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="calendar" size={36} color={COLORS.border} />
          <Text style={styles.emptyText}>No hay encuentros programados</Text>
        </View>
      ) : (
        encuentros.map(enc => {
          const comp1 = enc.competidores_encuentro?.[0];
          const comp2 = enc.competidores_encuentro?.[1];
          const name1 = comp1?.equipos?.nombre || comp1?.atletas?.nombre_completo || 'TBD';
          const name2 = comp2?.equipos?.nombre || comp2?.atletas?.nombre_completo || 'TBD';

          return (
            <View key={enc.id} style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="calendar" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{name1} vs {name2}</Text>
                <Text style={styles.cardSub}>
                  {new Date(enc.fecha_hora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} • {enc.sede_instalacion}
                </Text>
                <Text style={[styles.cardSub, { marginTop: 4, color: COLORS.success }]}>
                  Anotador: {enc.perfiles?.nombreCompleto || 'Sin asignar'}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );

  const getPendingCount = (tab: Tab) => {
    if (tab === 'equipos') return equiposPendientes.length;
    if (tab === 'anotadores') return anotadoresPendientes.length;
    if (tab === 'jueces') return juecesPendientes.length;
    return 0;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Skeleton Header */}
        <View style={styles.header}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <Skeleton width={150} height={20} />
          <View style={{ width: 32 }} />
        </View>

        {/* Skeleton Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: COLORS.white, borderColor: COLORS.border, borderWidth: 1 }]}>
          <Skeleton width={44} height={44} borderRadius={12} style={{ marginBottom: 12 }} />
          <Skeleton width="60%" height={24} style={{ marginBottom: 12 }} />
          <View style={styles.heroBadges}>
            <Skeleton width={70} height={20} borderRadius={7} />
            <Skeleton width={80} height={20} borderRadius={7} />
            <Skeleton width={60} height={20} borderRadius={7} />
          </View>
        </View>

        {/* Skeleton Tab Bar */}
        <View style={styles.tabBarContainer}>
          <View style={[styles.tabBarContent, { flexDirection: 'row' }]}>
            <Skeleton width={100} height={40} borderRadius={20} />
            <Skeleton width={100} height={40} borderRadius={20} />
            <Skeleton width={100} height={40} borderRadius={20} />
          </View>
        </View>

        {/* Skeleton List Items */}
        <View style={styles.tabContent}>
          <Skeleton width={120} height={16} style={{ marginBottom: 10, marginTop: 6 }} />
          {[1, 2, 3].map((_, i) => (
            <View key={i} style={styles.card}>
              <Skeleton width={42} height={42} borderRadius={11} />
              <View style={styles.cardInfo}>
                <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          ))}
        </View>
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
        <Text style={styles.headerTitle}>Gestión de Torneo</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Torneo Hero */}
      {torneo && (
        <LinearGradient
          colors={['#1E3A8A', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroIcon}>
            <Feather name="award" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>{torneo.nombre}</Text>
          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Feather name="zap" size={11} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>{torneo.deportes?.nombre}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Feather name="map-pin" size={11} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>{torneo.categoria_territorial}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Feather name="calendar" size={11} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>{torneo.temporada}</Text>
            </View>
          </View>
          {torneo.estado === 'en_curso' ? (
            <TouchableOpacity style={styles.finalizarBtn} onPress={handleFinalizarTorneo}>
              <Feather name="check-circle" size={14} color={COLORS.error} />
              <Text style={styles.finalizarBtnText}>Finalizar Torneo</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.finalizarBtn, { backgroundColor: COLORS.success + '20' }]}>
              <Feather name="award" size={14} color={COLORS.success} />
              <Text style={[styles.finalizarBtnText, { color: COLORS.success }]}>Torneo Finalizado</Text>
            </View>
          )}
        </LinearGradient>
      )}

      {/* Tab Bar */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map((tab, index) => {
            const pending = getPendingCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => handleTabPress(tab.key, index)}
              >
                <Feather name={tab.icon as any} size={isActive ? 18 : 16} color={isActive ? COLORS.primary : COLORS.textLight} />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                {pending > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{pending}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {activeTab === 'equipos' && renderEquiposTab()}
      {activeTab === 'anotadores' && renderPersonalTab('anotador', anotadoresPendientes, anotadoresActivos)}
      {activeTab === 'jueces' && renderPersonalTab('juez', juecesPendientes, juecesActivos)}
      {activeTab === 'jornadas' && renderJornadasTab()}
      {activeTab === 'comunicados' && renderComunicadosTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },

  heroCard: {
    marginHorizontal: 16, marginTop: 14, marginBottom: 0,
    borderRadius: 18, padding: 18,
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6
  },
  heroIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginBottom: 12, letterSpacing: -0.4 },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, gap: 4
  },
  heroBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  finalizarBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6, marginTop: 14, alignSelf: 'flex-start'
  },
  finalizarBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.error },

  tabBarContainer: {
    marginTop: 14,
    marginBottom: 8,
  },
  tabBarContent: {
    paddingHorizontal: 16, gap: 10, paddingVertical: 4
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, gap: 6,
    backgroundColor: COLORS.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
  },
  tabActive: { backgroundColor: '#EEF2FF', transform: [{ scale: 1.05 }], shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, paddingHorizontal: 18 },
  tabLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  tabLabelActive: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  tabBadge: {
    backgroundColor: COLORS.error, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3
  },
  tabBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },

  tabContent: { padding: 16 },

  subSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  subSectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, gap: 12
  },
  cardActive: { borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' },
  cardIcon: {
    width: 42, height: 42, borderRadius: 11,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center'
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  cardSub: { fontSize: 12, color: COLORS.textLight },

  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { backgroundColor: '#FEE2E2' },
  approveBtn: { backgroundColor: COLORS.success },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.textLight, fontStyle: 'italic' },
  
  newComunicadoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 16, borderRadius: 12, justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#C7D2FE', borderStyle: 'dashed', gap: 8 },
  newComunicadoText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  comunicadoCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  comunicadoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  comunicadoType: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  comunicadoDate: { fontSize: 11, color: COLORS.textLight },
  comunicadoTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark, marginBottom: 6 },
  comunicadoContent: { fontSize: 14, color: COLORS.textDark, lineHeight: 20 },
});
