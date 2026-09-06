import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getDepartamentos, getMunicipios, getOrganizacionById, updateOrganizacion } from '../../services/api';
import { Skeleton } from '../../components/SkeletonLoader';
import { useOrgContext } from '../../context/OrgContext';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  error: '#E63946',
};

export default function EditOrganizationScreen() {
  const { activeOrg, switchToOrg } = useOrgContext();
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState(activeOrg?.nombre || '');
  const [tipoInstitucion, setTipoInstitucion] = useState(activeOrg?.tipo_institucion || '');
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState<number | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const depts = await getDepartamentos();
        setDepartamentos(depts);
        
        if (activeOrg?.id) {
          const fullOrg = await getOrganizacionById(activeOrg.id);
          if (fullOrg) {
            setNombre(fullOrg.nombre);
            setTipoInstitucion(fullOrg.tipo_institucion);
            if (fullOrg.municipio_id && fullOrg.municipios?.departamento_id) {
              const deptoId = fullOrg.municipios.departamento_id;
              setSelectedDepartamento(deptoId);
              const muns = await getMunicipios(deptoId);
              setMunicipios(muns);
              setSelectedMunicipio(fullOrg.municipio_id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching initial edit data:', error);
      } finally {
        setIsFetchingLocation(false);
      }
    };
    fetchInitialData();
  }, [activeOrg?.id]);

  const handleDeptoSelect = async (deptoId: number) => {
    setSelectedDepartamento(deptoId);
    setSelectedMunicipio(null); // Clear selected municipio when switching depto
    const muns = await getMunicipios(deptoId);
    setMunicipios(muns);
  };

  const handleUpdate = async () => {
    if (!nombre || !tipoInstitucion || !selectedMunicipio) {
      Alert.alert('Error', 'Por favor llena todos los campos obligatorios');
      return;
    }

    if (!activeOrg?.id) return;

    setIsLoading(true);
    try {
      await updateOrganizacion(activeOrg.id, {
        nombre,
        tipo_institucion: tipoInstitucion,
        municipio_id: selectedMunicipio,
      });

      // Update context so the profile reflects changes instantly
      await switchToOrg({
        ...activeOrg,
        nombre,
        tipo_institucion: tipoInstitucion,
      });

      Alert.alert('Éxito', 'Organización actualizada correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar la organización');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isLoading}>
          <Feather name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Organización</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.sectionTitle}>Información General</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de la Organización</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Comisión Departamental de Béisbol"
            value={nombre}
            onChangeText={setNombre}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de Institución / Organización</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Comisión, Academia, Alcaldía..."
            value={tipoInstitucion}
            onChangeText={setTipoInstitucion}
            editable={!isLoading}
          />
        </View>

        <Text style={styles.sectionTitle}>Ubicación</Text>

        {isFetchingLocation ? (
          <View style={styles.inputGroup}>
            <Skeleton width={100} height={14} style={{ marginBottom: 8 }} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
               <Skeleton width={80} height={36} borderRadius={18} />
               <Skeleton width={100} height={36} borderRadius={18} />
               <Skeleton width={70} height={36} borderRadius={18} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Departamento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                {departamentos.map((dep) => (
                  <TouchableOpacity
                    key={dep.id}
                    onPress={() => handleDeptoSelect(dep.id)}
                    style={[styles.chip, selectedDepartamento === dep.id && styles.activeChip]}
                    disabled={isLoading}
                  >
                    <Text style={[styles.chipText, selectedDepartamento === dep.id && styles.activeChipText]}>
                      {dep.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedDepartamento && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Municipio</Text>
                {municipios.length === 0 ? (
                  <Text style={styles.emptyText}>Cargando municipios...</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                    {municipios.map((mun) => (
                      <TouchableOpacity
                        key={mun.id}
                        onPress={() => setSelectedMunicipio(mun.id)}
                        style={[styles.chip, selectedMunicipio === mun.id && styles.activeChip]}
                        disabled={isLoading}
                      >
                        <Text style={[styles.chipText, selectedMunicipio === mun.id && styles.activeChipText]}>
                          {mun.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </>
        )}

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={[styles.submitBtn, isLoading && { opacity: 0.7 }]} 
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitBtnText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  container: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginTop: 12, marginBottom: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, backgroundColor: COLORS.background },
  chipsContainer: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
  activeChipText: { color: COLORS.white, fontWeight: '600' },
  emptyText: { color: COLORS.textLight, fontStyle: 'italic' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
  submitBtn: { backgroundColor: COLORS.primary, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' }
});
