import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getTorneoById,
  getEquiposTorneo,
  getSolicitudesAcreditacionTorneo,
  programarEncuentro
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
};

export default function ProgramarEncuentroScreen() {
  const { id: orgId, torneoId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [torneo, setTorneo] = useState<any>(null);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [anotadores, setAnotadores] = useState<any[]>([]);

  // Form state
  const [equipoLocal, setEquipoLocal] = useState<string>('');
  const [equipoVisitante, setEquipoVisitante] = useState<string>('');
  const [anotadorId, setAnotadorId] = useState<string>('');
  
  // DateTimePicker states
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [fechaHoraText, setFechaHoraText] = useState('');
  const [sede, setSede] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tData, eqData, anData] = await Promise.all([
          getTorneoById(torneoId as string),
          getEquiposTorneo(torneoId as string, 'aprobado'),
          getSolicitudesAcreditacionTorneo(torneoId as string, 'anotador', 'aprobado')
        ]);
        setTorneo(tData);
        setEquipos(eqData);
        setAnotadores(anData);
        
        // Auto-select first if available
        if (eqData.length >= 2) {
          setEquipoLocal(eqData[0].equipos.id);
          setEquipoVisitante(eqData[1].equipos.id);
        }
        if (anData.length > 0) {
          setAnotadorId(anData[0].perfiles.id);
        }
      } catch (error) {
        console.error('Error fetching data for schedule:', error);
        Alert.alert('Error', 'No se pudo cargar la información del torneo');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [torneoId]);

  const handleProgramar = async () => {
    if (!equipoLocal || !equipoVisitante || !anotadorId || !fechaHoraText || !sede) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    if (equipoLocal === equipoVisitante) {
      Alert.alert('Equipos inválidos', 'El equipo local y visitante no pueden ser el mismo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        torneo_id: torneoId as string,
        anotador_id: anotadorId,
        fecha_hora: date.toISOString(),
        sede_instalacion: sede,
        competidores: [
          { equipo_id: equipoLocal, rol_posicion_etiqueta: 'Equipo A' },
          { equipo_id: equipoVisitante, rol_posicion_etiqueta: 'Equipo B' }
        ]
      };

      await programarEncuentro(payload);
      Alert.alert('Éxito', 'El encuentro ha sido programado correctamente.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un problema al programar el encuentro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <Skeleton width={150} height={20} />
          <View style={{ width: 32 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Skeleton width={100} height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={50} borderRadius={12} style={{ marginBottom: 18 }} />
          
          <View style={styles.vsContainer}>
            <Skeleton width={30} height={20} />
          </View>
          
          <Skeleton width={120} height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={50} borderRadius={12} style={{ marginBottom: 18 }} />
          
          <Skeleton width={140} height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={50} borderRadius={12} style={{ marginBottom: 18 }} />
          
          <Skeleton width="100%" height={50} borderRadius={12} style={{ marginTop: 10 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Programar Encuentro</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
         <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Equipo A</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={equipoLocal}
                onValueChange={(itemValue) => setEquipoLocal(itemValue)}
                style={styles.picker}
              >
                {equipos.map(eq => (
                  <Picker.Item key={eq.id} label={eq.equipos.nombre} value={eq.equipos.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Equipo B</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={equipoVisitante}
                onValueChange={(itemValue) => setEquipoVisitante(itemValue)}
                style={styles.picker}
              >
                {equipos.map(eq => (
                  <Picker.Item key={eq.id} label={eq.equipos.nombre} value={eq.equipos.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Anotador Asignado</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={anotadorId}
                onValueChange={(itemValue) => setAnotadorId(itemValue)}
                style={styles.picker}
              >
                {anotadores.map(ano => (
                  <Picker.Item key={ano.id} label={ano.perfiles.nombreCompleto} value={ano.perfiles.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Fecha y Hora</Text>
            <TouchableOpacity 
              style={[styles.input, { justifyContent: 'center' }]} 
              onPress={() => { setPickerMode('date'); setShowPicker(true); }}
            >
              <Text style={{ color: fechaHoraText ? COLORS.textDark : COLORS.textLight }}>
                {fechaHoraText || "Seleccionar Fecha y Hora"}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode={pickerMode}
                is24Hour={false}
                display="default"
                onValueChange={(event, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) {
                    setDate(selectedDate);
                    if (pickerMode === 'date') {
                      setTimeout(() => {
                        setPickerMode('time');
                        setShowPicker(true);
                      }, 100);
                    } else {
                      const year = selectedDate.getFullYear();
                      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const day = String(selectedDate.getDate()).padStart(2, '0');
                      const hours24 = selectedDate.getHours();
                      const ampm = hours24 >= 12 ? 'PM' : 'AM';
                      const hours12 = hours24 % 12 || 12;
                      const hoursStr = String(hours12).padStart(2, '0');
                      const mins = String(selectedDate.getMinutes()).padStart(2, '0');
                      setFechaHoraText(`${year}-${month}-${day} ${hoursStr}:${mins} ${ampm}`);
                      setPickerMode('date'); 
                    }
                  }
                }}
                onDismiss={() => {
                  setShowPicker(false);
                }}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sede o Instalación</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Estadio Nacional"
              value={sede}
              onChangeText={setSede}
            />
          </View>
         </View>

          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
            onPress={handleProgramar}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Agendar Partido</Text>
            )}
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { padding: 20 },
  formCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  formGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden'
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textDark
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: 4
  },
  vsText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textLight,
    fontStyle: 'italic'
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  submitBtnDisabled: {
    opacity: 0.7
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700'
  }
});
