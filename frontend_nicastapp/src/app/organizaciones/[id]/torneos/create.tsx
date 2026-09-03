import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { createTorneo, getDeportes } from '../../../../services/api';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  error: '#EF4444',
};

const CATEGORIAS_TERRITORIALES = [
  'Libre / Otra',
  'Campesina',
  'Municipal',
  'Departamental',
  'Nacional',
];

export default function CreateTorneoScreen() {
  const { id: organizacion_id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [nombre, setNombre] = useState('');
  const [temporada, setTemporada] = useState(new Date().getFullYear().toString());
  const [categoria, setCategoria] = useState(CATEGORIAS_TERRITORIALES[0]);
  const [deporteId, setDeporteId] = useState('');
  const [deportes, setDeportes] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDeportes, setIsFetchingDeportes] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await getDeportes();
        setDeportes(data);
        if (data.length > 0) {
          setDeporteId(data[0].id.toString());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetchingDeportes(false);
      }
    };
    fetchDepts();
  }, []);

  const handleCreate = async () => {
    if (!nombre || !temporada || !categoria || !deporteId) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      await createTorneo({
        nombre,
        temporada,
        categoria_territorial: categoria,
        deporte_id: deporteId,
        organizacion_id,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrar torneo.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isLoading}>
          <Feather name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Torneo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Feather name="award" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.pageTitle}>Registra una nueva liga o torneo</Text>
          <Text style={styles.pageSubtitle}>Define los detalles principales de la competición.</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre del Torneo / Liga</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Liga Mayor de Béisbol A"
            value={nombre}
            onChangeText={setNombre}
            editable={!isLoading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Temporada (Año)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 2026"
            value={temporada}
            onChangeText={setTemporada}
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoría Territorial</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoria}
              onValueChange={(itemValue) => setCategoria(itemValue)}
              enabled={!isLoading}
              style={{ color: COLORS.textDark }}
            >
              {CATEGORIAS_TERRITORIALES.map((cat, index) => (
                <Picker.Item key={index} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Disciplina Deportiva</Text>
          <View style={styles.pickerContainer}>
            {isFetchingDeportes ? (
              <ActivityIndicator color={COLORS.primary} style={{ padding: 12 }} />
            ) : (
              <Picker
                selectedValue={deporteId}
                onValueChange={(itemValue) => setDeporteId(itemValue)}
                enabled={!isLoading}
                style={{ color: COLORS.textDark }}
              >
                {deportes.map((dep) => (
                  <Picker.Item key={dep.id} label={dep.nombre} value={dep.id.toString()} />
                ))}
              </Picker>
            )}
          </View>
        </View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={[styles.submitBtn, isLoading && { opacity: 0.7 }]} 
          onPress={handleCreate}
          disabled={isLoading || isFetchingDeportes}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitBtnText}>Guardar Torneo</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  container: { padding: 20 },
  iconContainer: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textDark, textAlign: 'center', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', paddingHorizontal: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: COLORS.textDark },
  pickerContainer: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, overflow: 'hidden' },
  footer: { padding: 20, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
