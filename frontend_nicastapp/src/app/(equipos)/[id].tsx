import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/SkeletonLoader';
import { getEquipoById, getEquipoRoster, addAtletaToRoster, removeAtletaFromRoster, searchPerfiles, getTorneosDisponibles, solicitarInscripcionTorneo, getTorneosInscritos, getSolicitudesVinculacion, resolverSolicitudVinculacion } from '../../services/api';
import { router } from 'expo-router';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#3B82F6',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981'
};

export default function EquipoDetalle() {
  const { id } = useLocalSearchParams();
  const [equipo, setEquipo] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<'nominal' | 'buscar'>('nominal');
  const [nominalName, setNominalName] = useState('');
  const [nominalId, setNominalId] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Torneos Modal states
  const [showTorneosModal, setShowTorneosModal] = useState(false);
  const [torneosDisponibles, setTorneosDisponibles] = useState<any[]>([]);
  const [torneosInscritos, setTorneosInscritos] = useState<any[]>([]);
  const [loadingTorneos, setLoadingTorneos] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eqRes, rosterRes, torneosRes, solicitudesRes] = await Promise.all([
        getEquipoById(id as string),
        getEquipoRoster(id as string),
        getTorneosInscritos(id as string),
        getSolicitudesVinculacion(id as string)
      ]);
      setEquipo(eqRes);
      setRoster(rosterRes);
      setTorneosInscritos(torneosRes);
      setSolicitudes(solicitudesRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await searchPerfiles(searchQuery);
      setSearchResults(res);
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddNominal = async () => {
    if (!nominalName.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    try {
      await addAtletaToRoster(id as string, { nombre_completo: nominalName, identificacion: nominalId });
      Alert.alert('Éxito', 'Atleta agregado');
      setShowModal(false);
      setNominalName('');
      setNominalId('');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar al atleta');
    }
  };

  const handleAddUser = async (user: any) => {
    try {
      await addAtletaToRoster(id as string, { nombre_completo: user.nombreCompleto, perfil_id: user.id });
      Alert.alert('Éxito', 'Usuario agregado a la plantilla');
      setShowModal(false);
      setSearchResults([]);
      setSearchQuery('');
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo vincular al usuario');
    }
  };

  const handleRemoveAtleta = (atletaId: string, nombre: string) => {
    Alert.alert(
      'Dar de baja',
      `¿Estás seguro de eliminar a ${nombre} de la plantilla?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAtletaFromRoster(id as string, atletaId);
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo dar de baja al atleta');
            }
          }
        }
      ]
    );
  };

  const handleOpenTorneos = async () => {
    setShowTorneosModal(true);
    setLoadingTorneos(true);
    try {
      const res = await getTorneosDisponibles(id as string);
      setTorneosDisponibles(res);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los torneos disponibles');
    } finally {
      setLoadingTorneos(false);
    }
  };

  const handleInscribir = async (torneoId: string) => {
    try {
      await solicitarInscripcionTorneo(torneoId, id as string);
      Alert.alert('Éxito', 'Solicitud de inscripción enviada correctamente');
      setShowTorneosModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la solicitud');
    }
  };

  const handleResolverSolicitud = async (solicitudId: string, estado: 'aprobada' | 'rechazada') => {
    try {
      await resolverSolicitudVinculacion(id as string, solicitudId, estado);
      fetchData();
      Alert.alert('Éxito', `Solicitud ${estado} correctamente`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo resolver la solicitud');
    }
  };

  if (loading && !equipo) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil del Equipo</Text>
        </View>
        <ScrollView style={styles.container}>
          <View style={styles.coverPhoto}>
            <View style={styles.avatarContainer}>
              <Skeleton width={82} height={82} borderRadius={41} />
            </View>
          </View>
          <View style={styles.infoSection}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Skeleton width={200} height={28} style={{ marginBottom: 10 }} />
              <Skeleton width={120} height={24} borderRadius={16} />
            </View>
            <View style={styles.detailRow}>
              <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
              <View>
                <Skeleton width={100} height={14} style={{ marginBottom: 4 }} />
                <Skeleton width={150} height={16} />
              </View>
            </View>
            <View style={[styles.rosterHeader, { marginTop: 24 }]}>
              <Skeleton width={150} height={24} />
              <Skeleton width={80} height={32} borderRadius={8} />
            </View>
            <View style={styles.rosterList}>
              {[1, 2, 3].map(i => (
                <View key={i} style={styles.rosterItem}>
                  <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
                  <View style={styles.rosterInfo}>
                    <Skeleton width={120} height={16} style={{ marginBottom: 4 }} />
                    <Skeleton width={80} height={12} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil del Equipo</Text>
      </View>
      <ScrollView style={styles.container}>
      {/* Header / Portada */}
      <View style={styles.coverPhoto}>
        <View style={styles.avatarContainer}>
          <Feather name="shield" size={40} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.teamName}>{equipo?.nombre}</Text>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{equipo?.deportes?.nombre}</Text>
          </View>
          <TouchableOpacity style={[styles.badge, { backgroundColor: COLORS.primary, borderColor: COLORS.primary, marginLeft: 10 }]} onPress={handleOpenTorneos}>
            <Text style={[styles.badgeText, { color: COLORS.white }]}>Inscribir a Torneo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconBox}>
            <Feather name="map-pin" size={20} color={COLORS.secondary} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Sede / Ubicación</Text>
            <Text style={styles.detailValue}>
              {equipo?.municipios?.nombre}, {equipo?.municipios?.departamento?.nombre}
            </Text>
          </View>
        </View>
        
        {solicitudes.length > 0 && (
          <>
            <View style={[styles.rosterHeader, { marginTop: 10 }]}>
              <Text style={styles.detailTitle}>Solicitudes Pendientes</Text>
            </View>
            <View style={styles.rosterList}>
              {solicitudes.map(sol => (
                <View key={sol.id} style={styles.solicitudItem}>
                  <View style={styles.rosterInfo}>
                    <Text style={styles.rosterName}>{sol.perfiles.nombreCompleto}</Text>
                    <Text style={styles.rosterTypeNominal}>Reclama ser: {sol.atletas.nombre_completo}</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => handleResolverSolicitud(sol.id, 'aprobada')} style={[styles.actionBtn, {backgroundColor: COLORS.success, marginRight: 8}]}>
                      <Feather name="check" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleResolverSolicitud(sol.id, 'rechazada')} style={[styles.actionBtn, {backgroundColor: COLORS.error}]}>
                      <Feather name="x" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Plantilla / Roster */}
        <View style={[styles.rosterHeader, { marginTop: 24 }]}>
          <Text style={styles.detailTitle}>Plantilla de Jugadores</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <Feather name="plus" size={16} color={COLORS.white} />
            <Text style={styles.addButtonText}>Añadir</Text>
          </TouchableOpacity>
        </View>

        {roster.length === 0 ? (
          <View style={styles.emptyRoster}>
            <Feather name="users" size={32} color={COLORS.textLight} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyRosterTitle}>Roster vacío</Text>
            <Text style={styles.emptyRosterDesc}>Aún no hay atletas registrados en este equipo.</Text>
          </View>
        ) : (
          <View style={styles.rosterList}>
            {roster.map(atleta => (
              <TouchableOpacity 
                key={atleta.id} 
                style={styles.rosterItem}
                onPress={() => router.push(`/atleta/${atleta.id}`)}
              >
                <View style={styles.rosterAvatar}>
                  <Text style={styles.rosterAvatarText}>{atleta.nombre_completo.charAt(0)}</Text>
                </View>
                <View style={styles.rosterInfo}>
                  <Text style={styles.rosterName}>{atleta.nombre_completo}</Text>
                  {atleta.perfil_id ? (
                    <Text style={styles.rosterTypeLinked}><Feather name="link" size={12}/> Cuenta vinculada</Text>
                  ) : (
                    <Text style={styles.rosterTypeNominal}>Nominal</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleRemoveAtleta(atleta.id, atleta.nombre_completo)} style={styles.removeBtn}>
                  <Feather name="trash-2" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mis Torneos */}
        <View style={[styles.rosterHeader, { marginTop: 24 }]}>
          <Text style={styles.detailTitle}>Mis Torneos</Text>
        </View>
        
        {torneosInscritos.length === 0 ? (
          <View style={styles.emptyRoster}>
            <Feather name="award" size={32} color={COLORS.textLight} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyRosterTitle}>Sin torneos</Text>
            <Text style={styles.emptyRosterDesc}>El equipo no está participando en ningún torneo.</Text>
          </View>
        ) : (
          <View style={styles.rosterList}>
            {torneosInscritos.map(inscripcion => (
              <TouchableOpacity 
                key={inscripcion.id} 
                style={styles.torneoCard}
                onPress={() => router.push(`/(equipos)/${id}/torneos/${inscripcion.torneo_id}`)}
              >
                <View style={styles.torneoInfo}>
                  <Text style={styles.torneoName}>{inscripcion.torneos?.nombre}</Text>
                  <Text style={styles.torneoDesc}>Estado Inscripción: {inscripcion.estado_inscripcion}</Text>
                  <Text style={styles.torneoOrg}>Organiza: {inscripcion.torneos?.organizaciones?.nombre}</Text>
                </View>
                <Feather name="chevron-right" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Modal Añadir Atleta */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Atleta</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
              <TouchableOpacity style={[styles.tab, tab === 'nominal' && styles.tabActive]} onPress={() => setTab('nominal')}>
                <Text style={[styles.tabText, tab === 'nominal' && styles.tabTextActive]}>Registro Nominal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, tab === 'buscar' && styles.tabActive]} onPress={() => setTab('buscar')}>
                <Text style={[styles.tabText, tab === 'buscar' && styles.tabTextActive]}>Buscar Usuario</Text>
              </TouchableOpacity>
            </View>

            {tab === 'nominal' ? (
              <View style={styles.tabContent}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput style={styles.input} placeholder="Ej. Juan Pérez" value={nominalName} onChangeText={setNominalName} />
                <Text style={styles.label}>Documento de Identidad (Opcional)</Text>
                <TextInput style={styles.input} placeholder="Ej. 001-000000-0000X" value={nominalId} onChangeText={setNominalId} />
                
                <TouchableOpacity style={styles.submitBtn} onPress={handleAddNominal}>
                  <Text style={styles.submitBtnText}>Guardar Atleta</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tabContent}>
                <View style={styles.searchBar}>
                  <TextInput style={styles.searchInput} placeholder="Buscar por nombre..." value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearch} />
                  <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                    <Feather name="search" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </View>

                {searching ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    style={{ maxHeight: 250, marginTop: 10 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.searchResultItem} onPress={() => handleAddUser(item)}>
                        <View style={styles.searchResultAvatar}>
                          <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.nombreCompleto.charAt(0)}</Text>
                        </View>
                        <Text style={styles.searchResultName}>{item.nombreCompleto}</Text>
                        <Feather name="user-plus" size={20} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      searchQuery && searchResults.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20}}>No se encontraron usuarios</Text> : null
                    }
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Torneos */}
      <Modal visible={showTorneosModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Torneos Disponibles</Text>
              <TouchableOpacity onPress={() => setShowTorneosModal(false)}>
                <Feather name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            {loadingTorneos ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : torneosDisponibles.length === 0 ? (
              <View style={styles.emptyRoster}>
                <Text style={styles.emptyRosterTitle}>No hay torneos abiertos</Text>
                <Text style={styles.emptyRosterDesc}>En este momento no hay torneos disponibles para inscripción en tu disciplina.</Text>
              </View>
            ) : (
              <FlatList
                data={torneosDisponibles}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.torneoCard}>
                    <View style={styles.torneoInfo}>
                      <Text style={styles.torneoName}>{item.nombre}</Text>
                      <Text style={styles.torneoDesc}>{item.categoria_territorial} - Temporada {item.temporada}</Text>
                      <Text style={styles.torneoOrg}>Organiza: {item.organizaciones?.nombre}</Text>
                    </View>
                    <TouchableOpacity style={styles.inscribirBtn} onPress={() => handleInscribir(item.id)}>
                      <Text style={styles.inscribirBtnText}>Solicitar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { padding: 8, marginRight: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverPhoto: { height: 120, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20, position: 'relative' },
  avatarContainer: { position: 'absolute', bottom: -40, width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: COLORS.background },
  infoSection: { padding: 20, paddingTop: 50 },
  teamName: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 10 },
  badgeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  badgeText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  detailLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  rosterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  detailTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  addButton: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: COLORS.white, fontWeight: 'bold', marginLeft: 4 },
  rosterList: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  rosterItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rosterAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rosterAvatarText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  rosterInfo: { flex: 1 },
  rosterName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  rosterTypeNominal: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  rosterTypeLinked: { fontSize: 12, color: COLORS.success, marginTop: 2 },
  removeBtn: { padding: 8 },
  emptyRoster: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  emptyRosterTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyRosterDesc: { fontSize: 14, color: COLORS.textLight, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  tabsContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#F1F5F9', borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: {width: 0, height: 1}, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.primary },
  tabContent: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, fontSize: 15 },
  submitBtn: { backgroundColor: COLORS.primary, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  searchBar: { flexDirection: 'row', marginBottom: 10 },
  searchInput: { flex: 1, height: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 15, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 },
  searchBtn: { width: 56, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchResultAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.textLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  searchResultName: { flex: 1, fontSize: 15, color: COLORS.text },
  torneoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginBottom: 12 },
  torneoInfo: { flex: 1, marginRight: 12 },
  torneoName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  torneoDesc: { fontSize: 13, color: COLORS.textLight, marginBottom: 2 },
  torneoOrg: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  inscribirBtn: { backgroundColor: COLORS.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  inscribirBtnText: { color: COLORS.white, fontWeight: 'bold' },
  solicitudItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#FFFBEB' },
  actionBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }
});
