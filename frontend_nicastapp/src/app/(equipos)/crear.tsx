import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../../services/api';
import { createEquipo, getComunidades } from '../../services/api';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#3B82F6',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
};

export default function CrearEquipo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [deporteId, setDeporteId] = useState('');
  
  // Location states
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [deportes, setDeportes] = useState([]);
  
  const [selectedDepto, setSelectedDepto] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        const [deptosRes, deportesRes] = await Promise.all([
          apiCall('/catalog/departamentos'),
          apiCall('/deportes')
        ]);
        
        setDepartamentos(deptosRes);
        setDeportes(deportesRes);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    initData();
  }, []);

  const handleDeptoChange = async (itemValue: string) => {
    setSelectedDepto(itemValue);
    setSelectedMunicipio('');
    setMunicipios([]);
    
    if (itemValue) {
      try {
        const res = await apiCall(`/catalog/municipios/${itemValue}`);
        setMunicipios(res);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleMunicipioChange = async (itemValue: string) => {
    setSelectedMunicipio(itemValue);
  };

  const handleSubmit = async () => {
    if (!nombre.trim() || !deporteId || !selectedMunicipio) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los campos para continuar.');
      return;
    }

    setLoading(true);
    try {
      await createEquipo({
        nombre,
        deporte_id: parseInt(deporteId, 10),
        municipio_id: parseInt(selectedMunicipio, 10),
        administrador_id: user.id
      });
      
      Alert.alert('Éxito', 'Equipo creado correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo crear el equipo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Equipo</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del Equipo</Text>
          <View style={styles.inputContainer}>
            <Feather name="shield" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej. Los Tigres, Academia FC..."
              value={nombre}
              onChangeText={setNombre}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Disciplina Deportiva</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={deporteId}
              onValueChange={(itemValue) => setDeporteId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona una disciplina..." value="" />
              {deportes.map((dep: any) => (
                <Picker.Item key={dep.id} label={dep.nombre} value={dep.id.toString()} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sede (Ubicación)</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Departamento</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDepto}
              onValueChange={handleDeptoChange}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona un departamento..." value="" />
              {departamentos.map((depto: any) => (
                <Picker.Item key={depto.id} label={depto.nombre} value={depto.id.toString()} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Municipio</Text>
          <View style={[styles.pickerContainer, !selectedDepto && styles.pickerDisabled]}>
            <Picker
              selectedValue={selectedMunicipio}
              onValueChange={handleMunicipioChange}
              style={styles.picker}
              enabled={!!selectedDepto}
            >
              <Picker.Item label="Selecciona un municipio..." value="" />
              {municipios.map((mun: any) => (
                <Picker.Item key={mun.id} label={mun.nombre} value={mun.id.toString()} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Feather name="check" size={20} color={COLORS.white} />
            <Text style={styles.submitButtonText}>Registrar Equipo</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: COLORS.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  pickerDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  }
});
