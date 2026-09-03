import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { apiCall, asignarPersonalTorneo } from '../../../../../services/api';
import { Skeleton } from '../../../../../components/SkeletonLoader';

const COLORS = {
  primary: '#2563EB',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  subText: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
};

export default function AsignarPersonalScreen() {
  const router = useRouter();
  const { id, torneoId, rol } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [personalOrg, setPersonalOrg] = useState<any[]>([]);
  const [personalTorneo, setPersonalTorneo] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch org accreditations
      const orgData = await apiCall(`/organizaciones/${id}/acreditaciones`);
      
      // Fetch tournament accreditations
      const torneoData = await apiCall(`/torneos/${torneoId}/solicitudes?rol=${rol}`);

      // Filter org data: only approved and matching role
      const approvedForRole = orgData.filter((a: any) => 
        a.estado_aprobacion === 'aprobado' && a.rol_acreditacion === rol
      );

      setPersonalOrg(approvedForRole);
      setPersonalTorneo(torneoData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudo cargar el personal');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (acreditacion: any) => {
    try {
      setLoading(true);
      await asignarPersonalTorneo(torneoId as string, {
        perfil_id: acreditacion.perfil_id,
        organizacion_id: acreditacion.organizacion_id,
        deporte_id: acreditacion.deporte_id,
        rol_acreditacion: acreditacion.rol_acreditacion,
      });
      Alert.alert('Éxito', 'Personal asignado correctamente al torneo');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo asignar el personal');
      setLoading(false);
    }
  };

  // filter out those already in tournament
  const availablePersonal = personalOrg.filter(orgAcred => 
    !personalTorneo.some(torneoAcred => torneoAcred.perfil_id === orgAcred.perfil_id)
  );

  const filteredData = availablePersonal.filter(p => 
    p.perfiles?.nombreCompleto?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && personalOrg.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Asignar {rol === 'anotador' ? 'Anotador' : 'Juez'}</Text>
        </View>
        <View style={styles.list}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.card}>
              <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 15 }} />
              <View style={styles.cardInfo}>
                <Skeleton width="60%" height={20} style={{ marginBottom: 4 }} />
                <Skeleton width="40%" height={16} />
              </View>
              <Skeleton width={80} height={35} borderRadius={6} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Asignar {rol === 'anotador' ? 'Anotador' : 'Juez'}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={COLORS.subText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Feather name="user" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.perfiles?.nombreCompleto || 'Sin nombre'}</Text>
              <Text style={styles.cardSub}>{item.deportes?.nombre || 'Deporte no especificado'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.assignButton}
              onPress={() => handleAssign(item)}
            >
              <Text style={styles.assignButtonText}>Asignar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No hay personal disponible para asignar.</Text>
            <Text style={styles.emptySubText}>Asegúrate de que la organización haya aprobado acreditaciones para este rol.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, textTransform: 'capitalize' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, fontSize: 16, color: COLORS.text },
  list: { padding: 15 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: COLORS.subText },
  assignButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  assignButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginTop: 15, textAlign: 'center' },
  emptySubText: { fontSize: 14, color: COLORS.subText, marginTop: 5, textAlign: 'center' },
});
