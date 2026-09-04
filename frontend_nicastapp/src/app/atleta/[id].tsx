import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAtletaFicha, reclamarFicha } from '../../services/api';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#FFB81C',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
};

export default function FichaAtletaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [myPerfilId, setMyPerfilId] = useState<string | null>(null);

  useEffect(() => {
    fetchFicha();
    fetchMyPerfil();
  }, [id]);

  const fetchMyPerfil = async () => {
    try {
      const p = await AsyncStorage.getItem('@perfil');
      if (p) {
        setMyPerfilId(JSON.parse(p).id);
      }
    } catch (e) {}
  };

  const fetchFicha = async () => {
    try {
      const response = await getAtletaFicha(id as string);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReclamar = async () => {
    if (!myPerfilId) return;
    try {
      await reclamarFicha(id as string, myPerfilId);
      Alert.alert('Éxito', 'Solicitud enviada al administrador del equipo.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la solicitud.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!data || !data.atleta) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>No se pudo cargar la ficha del atleta.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { atleta, perfil_vinculado, metricas_globales, metricas_por_torneo, historial_equipos } = data;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Feather name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha Digital</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* PERFIL CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {perfil_vinculado?.avatarUrl ? (
              <Image source={{ uri: perfil_vinculado.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={40} color={COLORS.primary} />
              </View>
            )}
            {perfil_vinculado?.verificado && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={24} color={COLORS.success} />
              </View>
            )}
          </View>
          
          <Text style={styles.athleteName}>{atleta.nombre_completo}</Text>
          
          {perfil_vinculado ? (
            <Text style={styles.locationText}>
              <Feather name="map-pin" size={14} /> {perfil_vinculado.municipio?.nombre}, {perfil_vinculado.municipio?.departamento?.nombre}
            </Text>
          ) : (
            <Text style={styles.unlinkedText}>
              Registro Nominal
            </Text>
          )}

          {!perfil_vinculado && myPerfilId && (
            <TouchableOpacity style={styles.claimButton} onPress={handleReclamar}>
              <Feather name="shield" size={16} color={COLORS.white} />
              <Text style={styles.claimButtonText}>Reclamar Identidad</Text>
            </TouchableOpacity>
          )}

          {atleta.equipo_actual && (
            <View style={styles.teamContainer}>
              <Feather name="shield" size={16} color={COLORS.secondary} />
              <Text style={styles.teamText}>{atleta.equipo_actual.nombre}</Text>
            </View>
          )}
        </View>

        {/* ETIQUETAS DE VERIFICACIÓN */}
        {perfil_vinculado?.verificado && (
          <View style={styles.verifiedBanner}>
            <MaterialIcons name="security" size={20} color={COLORS.success} />
            <Text style={styles.verifiedBannerText}>
              Identidad Verificada Oficialmente
            </Text>
          </View>
        )}

        {/* RENDIMIENTO GLOBAL */}
        <Text style={styles.sectionTitle}>Rendimiento Oficial Acumulado</Text>
        {metricas_globales && metricas_globales.length > 0 ? (
          <View style={styles.statsGrid}>
            {metricas_globales.map((metrica: any, index: number) => (
              <View key={index} style={styles.statBox}>
                <Text style={styles.statValue}>{metrica.total}</Text>
                <Text style={styles.statLabel}>{metrica.nombre_visible}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStats}>
            <Feather name="bar-chart-2" size={32} color={COLORS.border} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyStatsText}>No hay estadísticas registradas en actas oficiales aún.</Text>
          </View>
        )}

        {/* RENDIMIENTO POR TORNEO */}
        {metricas_por_torneo && metricas_por_torneo.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Rendimiento por Torneo</Text>
            {metricas_por_torneo.map((torneo: any, idx: number) => (
              <View key={idx} style={styles.torneoCard}>
                <View style={styles.torneoHeader}>
                  <Text style={styles.torneoNombre}>{torneo.nombre}</Text>
                  <Text style={styles.torneoDetalle}>
                    {torneo.temporada} • {torneo.deporte} • {torneo.categoria_territorial}
                  </Text>
                </View>
                <View style={styles.statsGrid}>
                  {torneo.metricas_acumuladas.map((metrica: any, mIdx: number) => (
                    <View key={mIdx} style={styles.statBoxTorneo}>
                      <Text style={styles.statValueTorneo}>{metrica.total}</Text>
                      <Text style={styles.statLabelTorneo}>{metrica.nombre_visible}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        {/* HISTORIAL DE REPRESENTACIONES */}
        {historial_equipos && historial_equipos.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Historial de Representaciones</Text>
            <View style={styles.historyContainer}>
              {historial_equipos.map((item: any, idx: number) => (
                <View key={idx} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  {idx !== historial_equipos.length - 1 && <View style={styles.historyLine} />}
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTeam}>{item.equipo?.nombre}</Text>
                    <Text style={styles.historyTournament}>{item.torneo?.nombre}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.fecha).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backIcon: { padding: 4 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  athleteName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  unlinkedText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  claimButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  teamText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#854D0E',
    marginLeft: 8,
  },
  
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 24,
    justifyContent: 'center',
  },
  verifiedBannerText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyStats: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyStatsText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  torneoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  torneoHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  torneoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  torneoDetalle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statBoxTorneo: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValueTorneo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabelTorneo: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  historyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    marginTop: 4,
    marginRight: 16,
    zIndex: 2,
  },
  historyLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: -24,
    width: 2,
    backgroundColor: COLORS.border,
    zIndex: 1,
  },
  historyContent: {
    flex: 1,
  },
  historyTeam: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  historyTournament: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },

  errorText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  }
});
