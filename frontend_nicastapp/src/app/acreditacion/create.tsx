import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllOrganizaciones, getDeportes, solicitarAcreditacionTecnica } from '../../services/api';
import { Skeleton } from '../../components/SkeletonLoader';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  error: '#E63946',
  success: '#10B981',
};

export default function CreateAcreditacionScreen() {
  const insets = useSafeAreaInsets();
  
  const [organizaciones, setOrganizaciones] = useState<any[]>([]);
  const [deportes, setDeportes] = useState<any[]>([]);
  
  const [selectedRol, setSelectedRol] = useState<'anotador' | 'juez' | null>(null);
  const [selectedDeporte, setSelectedDeporte] = useState<number | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgs, deps] = await Promise.all([
          getAllOrganizaciones(),
          getDeportes()
        ]);
        setOrganizaciones(orgs);
        setDeportes(deps);
      } catch (error) {
        console.error('Error fetching data para acreditacion:', error);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedRol || !selectedDeporte || !selectedOrg) {
      Alert.alert('Error', 'Por favor selecciona el rol, deporte y la organización.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userDataStr = await AsyncStorage.getItem('@user');
      if (!userDataStr) throw new Error('No estás autenticado');
      const user = JSON.parse(userDataStr);

      await solicitarAcreditacionTecnica(selectedOrg, {
        perfil_id: user.id,
        deporte_id: selectedDeporte,
        rol_acreditacion: selectedRol
      });

      Alert.alert('Éxito', 'Solicitud enviada correctamente. Espera la aprobación de la organización.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isSubmitting}>
          <Feather name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acreditación Técnica</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionDesc}>
          Solicita unirte a una Organización para desempeñar un rol técnico en una disciplina específica.
        </Text>

        {isFetchingData ? (
          <View style={{ marginTop: 20 }}>
            <Skeleton width="40%" height={20} style={{ marginBottom: 12 }} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              <Skeleton width={100} height={40} borderRadius={20} />
              <Skeleton width={100} height={40} borderRadius={20} />
            </View>
            
            <Skeleton width="50%" height={20} style={{ marginBottom: 12 }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              <Skeleton width={80} height={36} borderRadius={18} />
              <Skeleton width={90} height={36} borderRadius={18} />
              <Skeleton width={85} height={36} borderRadius={18} />
            </View>

            <Skeleton width="40%" height={20} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={50} borderRadius={12} style={{ marginBottom: 10 }} />
            <Skeleton width="100%" height={50} borderRadius={12} style={{ marginBottom: 10 }} />
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>1. Selecciona un Rol</Text>
              <View style={styles.chipsContainer}>
                <TouchableOpacity
                  style={[styles.chip, selectedRol === 'anotador' && styles.chipActive]}
                  onPress={() => setSelectedRol('anotador')}
                >
                  <Text style={[styles.chipText, selectedRol === 'anotador' && styles.chipTextActive]}>Anotador</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, selectedRol === 'juez' && styles.chipActive]}
                  onPress={() => setSelectedRol('juez')}
                >
                  <Text style={[styles.chipText, selectedRol === 'juez' && styles.chipTextActive]}>Juez / Árbitro</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>2. Disciplina Deportiva</Text>
              <View style={styles.chipsContainer}>
                {deportes.map(dep => (
                  <TouchableOpacity
                    key={dep.id}
                    style={[styles.chip, selectedDeporte === dep.id && styles.chipActive]}
                    onPress={() => setSelectedDeporte(dep.id)}
                  >
                    <Text style={[styles.chipText, selectedDeporte === dep.id && styles.chipTextActive]}>{dep.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>3. Organización a la que deseas unirte</Text>
              
              <View style={styles.searchContainer}>
                <Feather name="search" size={18} color={COLORS.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar organización por nombre o ubicación..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              {organizaciones.filter(org => 
                org.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (org.municipios?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <Text style={styles.emptyText}>No se encontraron organizaciones</Text>
              ) : (
                organizaciones
                  .filter(org => 
                    org.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (org.municipios?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(org => (
                  <TouchableOpacity
                    key={org.id}
                    style={[styles.orgCard, selectedOrg === org.id && styles.orgCardActive]}
                    onPress={() => setSelectedOrg(org.id)}
                  >
                    <View style={[styles.orgIcon, selectedOrg === org.id && { backgroundColor: '#EEF2FF' }]}>
                      <Feather name="shield" size={20} color={selectedOrg === org.id ? COLORS.primary : COLORS.textLight} />
                    </View>
                    <View style={styles.orgInfo}>
                      <Text style={[styles.orgName, selectedOrg === org.id && { color: COLORS.primary }]}>{org.nombre}</Text>
                      <Text style={styles.orgSub}>{org.municipios?.nombre || 'Sin ubicación'}</Text>
                    </View>
                    {selectedOrg === org.id && (
                      <Feather name="check-circle" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>

            <TouchableOpacity 
              style={[
                styles.submitBtn,
                (!selectedRol || !selectedDeporte || !selectedOrg || isSubmitting) && styles.submitBtnDisabled
              ]}
              onPress={handleSubmit}
              disabled={!selectedRol || !selectedDeporte || !selectedOrg || isSubmitting}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  container: { padding: 20, paddingBottom: 100 },
  sectionDesc: { fontSize: 14, color: COLORS.textLight, marginBottom: 24, lineHeight: 20 },
  
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },
  
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: '#EEF2FF', borderColor: COLORS.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  chipTextActive: { color: COLORS.primary },
  
  orgCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 10,
  },
  orgCardActive: { borderColor: COLORS.primary, backgroundColor: '#F8FAFF' },
  orgIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  orgInfo: { flex: 1 },
  orgName: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  orgSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  emptyText: { fontSize: 14, color: COLORS.textLight, fontStyle: 'italic' },
  
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 10,
  },
  submitBtnDisabled: { backgroundColor: '#94A3B8' },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 12,
    marginBottom: 16, height: 44, gap: 8
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textDark },
});
