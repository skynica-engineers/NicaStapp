import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { createComunicado, getOrganizacionById } from '../../../../services/api';
import { Skeleton } from '../../../../components/SkeletonLoader';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  error: '#EF4444',
};

export default function CreateComunicadoScreen() {
  const { id: orgId, torneoId: passedTorneoId } = useLocalSearchParams();
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tipoAviso, setTipoAviso] = useState('');
  const [selectedTorneoId, setSelectedTorneoId] = useState<string | null>((passedTorneoId as string) || null);

  const [torneos, setTorneos] = useState<any[]>([]);
  const [isLoadingTorneos, setIsLoadingTorneos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Si no venimos de un torneo específico, cargamos los torneos por si quiere asociarlo
    if (!passedTorneoId && orgId) {
      setIsLoadingTorneos(true);
      getOrganizacionById(orgId as string).then(data => {
        setTorneos(data?.torneos || []);
      }).catch(console.error).finally(() => setIsLoadingTorneos(false));
    }
  }, [orgId, passedTorneoId]);

  const handleCreate = async () => {
    if (!titulo.trim() || !contenido.trim() || !tipoAviso.trim()) {
      Alert.alert('Error', 'Completa todos los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createComunicado(orgId as string, {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        tipo_aviso: tipoAviso.trim(),
        torneo_id: selectedTorneoId || undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudo publicar el comunicado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Comunicado</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Título del comunicado *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Programación Jornada 4"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Tipo de aviso *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Informativo, Disciplinario, Urgente..."
          value={tipoAviso}
          onChangeText={setTipoAviso}
        />

        {!passedTorneoId && (
          <>
            <Text style={styles.label}>Asociar a un Torneo (Opcional)</Text>
            {isLoadingTorneos ? (
               <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 8 }}>
                  <Skeleton width={80} height={38} borderRadius={19} />
                  <Skeleton width={100} height={38} borderRadius={19} />
                  <Skeleton width={120} height={38} borderRadius={19} />
               </View>
            ) : torneos.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.torneosList}>
                <TouchableOpacity
                  style={[styles.torneoChip, !selectedTorneoId && styles.torneoChipActive]}
                  onPress={() => setSelectedTorneoId(null)}
                >
                  <Text style={[styles.torneoChipText, !selectedTorneoId && styles.torneoChipTextActive]}>General</Text>
                </TouchableOpacity>
                {torneos.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.torneoChip, selectedTorneoId === t.id && styles.torneoChipActive]}
                    onPress={() => setSelectedTorneoId(t.id)}
                  >
                    <Text style={[styles.torneoChipText, selectedTorneoId === t.id && styles.torneoChipTextActive]}>{t.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
          </>
        )}

        <Text style={styles.label}>Contenido *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escribe el cuerpo del comunicado..."
          value={contenido}
          onChangeText={setContenido}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitText}>Publicar Comunicado</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  backBtn: { padding: 4 },
  container: { padding: 20, paddingBottom: 60 },

  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.textDark },
  textArea: { height: 160, paddingTop: 16 },

  torneosList: { gap: 8, marginTop: 4, marginBottom: 8 },
  torneoChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  torneoChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  torneoChipText: { fontSize: 14, color: COLORS.textDark },
  torneoChipTextActive: { color: COLORS.white, fontWeight: '600' },

  submitBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 32 },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
