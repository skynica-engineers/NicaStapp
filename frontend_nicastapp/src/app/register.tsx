import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { apiCall } from '../services/api';

// Colors from Palette
const COLORS = {
  primary: '#0F3D91',
  secondary: '#2563EB',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F1F5F9', // Light gray background for contrast
  border: '#E2E8F0',
  error: '#E63946',
};

interface Departamento {
  id: number;
  nombre: string;
}

interface Municipio {
  id: number;
  nombre: string;
  departamentoId: number;
}

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  
  const [departamentoId, setDepartamentoId] = useState<string>('');
  const [municipioId, setMunicipioId] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Cargar departamentos al iniciar
    const fetchDepartamentos = async () => {
      try {
        const data = await apiCall('/catalog/departamentos', 'GET');
        setDepartamentos(data);
      } catch (error) {
        console.error('Error cargando departamentos:', error);
      }
    };
    fetchDepartamentos();
  }, []);

  useEffect(() => {
    // Cargar municipios cuando cambia el departamento
    const fetchMunicipios = async () => {
      if (!departamentoId) {
        setMunicipios([]);
        setMunicipioId('');
        return;
      }
      try {
        const data = await apiCall(`/catalog/municipios/${departamentoId}`, 'GET');
        setMunicipios(data);
      } catch (error) {
        console.error('Error cargando municipios:', error);
      }
    };
    fetchMunicipios();
  }, [departamentoId]);

  const handleRegister = async () => {
    try {
      if (!nombre || !apellido || !email || !password || !departamentoId || !municipioId) {
        alert('Por favor, completa todos los campos.');
        return;
      }

      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }

      const result = await apiCall('/auth/register', 'POST', {
        nombre,
        apellido,
        email,
        password,
        departamentoId: Number(departamentoId),
        municipioId: Number(municipioId),
      });

      alert('¡Cuenta creada con éxito!');
      router.push('/'); // Go to login
    } catch (error: any) {
      alert(`Error al registrar: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Feather name="flag" size={32} color={COLORS.primary} style={styles.headerIcon} />
            <Text style={styles.title}>NICASTAPP</Text>
            <Text style={styles.subtitle}>
              Únete a la comunidad deportiva.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Juan"
                  placeholderTextColor="#94A3B8"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>
            </View>

            {/* Apellido */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Pérez"
                  placeholderTextColor="#94A3B8"
                  value={apellido}
                  onChangeText={setApellido}
                />
              </View>
            </View>

            {/* Correo Electrónico */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="juan.perez@ejemplo.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Departamento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Departamento</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={departamentoId}
                  onValueChange={(itemValue) => setDepartamentoId(itemValue)}
                  style={styles.picker}
                  mode="dropdown"
                >
                  <Picker.Item label="Seleccione..." value="" color="#94A3B8" />
                  {departamentos.map(dep => (
                    <Picker.Item key={dep.id.toString()} label={dep.nombre} value={dep.id.toString()} color={COLORS.textDark} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Municipio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Municipio</Text>
              <View style={[styles.pickerContainer, !departamentoId && styles.pickerDisabled]}>
                <Picker
                  selectedValue={municipioId}
                  onValueChange={(itemValue) => setMunicipioId(itemValue)}
                  style={styles.picker}
                  enabled={!!departamentoId}
                  mode="dropdown"
                >
                  <Picker.Item label="Seleccione..." value="" color="#94A3B8" />
                  {municipios.map(mun => (
                    <Picker.Item key={mun.id.toString()} label={mun.nombre} value={mun.id.toString()} color={COLORS.textDark} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Crear cuenta</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>

        {/* Login Link - Fixed at Bottom */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.footerLink}>Inicia sesión aquí</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    minHeight: 52, // Increased height for better interaction
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: COLORS.textDark,
  },
  eyeIcon: {
    padding: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    minHeight: 52, // Increased minHeight to prevent cut off text
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 0 : 4, // Add padding on Android
  },
  picker: {
    width: '100%',
    ...Platform.select({
      ios: {
        height: 150, // iOS picker needs explicit height
      },
      android: {
        height: 52, // Match container height for Android
      },
    }),
  },
  pickerDisabled: {
    backgroundColor: COLORS.background,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
