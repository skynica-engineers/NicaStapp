import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { apiCall } from '../services/api';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#2563EB',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F1F5F9',
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
  const [isLoading, setIsLoading] = useState(false);

  // Errors state
  const [errors, setErrors] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    departamentoId: '',
    municipioId: '',
  });

  useEffect(() => {
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

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
      departamentoId: '',
      municipioId: '',
    };

    if (!nombre.trim()) { newErrors.nombre = 'El nombre es obligatorio'; valid = false; }
    if (!apellido.trim()) { newErrors.apellido = 'El apellido es obligatorio'; valid = false; }
    
    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio'; valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido'; valid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria'; valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Debe tener al menos 6 caracteres'; valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña'; valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'; valid = false;
    }

    if (!departamentoId) { newErrors.departamentoId = 'Selecciona un departamento'; valid = false; }
    if (!municipioId) { newErrors.municipioId = 'Selecciona un municipio'; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor, corrige los errores en el formulario.');
      return;
    }

    setIsLoading(true);
    try {
      await apiCall('/auth/register', 'POST', {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password,
        departamentoId: Number(departamentoId),
        municipioId: Number(municipioId),
      });

      Alert.alert('Éxito', '¡Cuenta creada con éxito!', [
        { text: 'OK', onPress: () => router.push('/') }
      ]);
    } catch (error: any) {
      Alert.alert('Error al registrar', error.message || 'Ocurrió un problema, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const InputError = ({ msg }: { msg: string }) => {
    if (!msg) return null;
    return <Text style={styles.errorText}>{msg}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Feather name="flag" size={32} color={COLORS.primary} style={styles.headerIcon} />
            <Text style={styles.title}>NICASTAPP</Text>
            <Text style={styles.subtitle}>Únete a la comunidad deportiva.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <View style={[styles.inputContainer, errors.nombre ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="Juan"
                  placeholderTextColor="#94A3B8"
                  value={nombre}
                  onChangeText={(val) => { setNombre(val); setErrors({ ...errors, nombre: '' }); }}
                  editable={!isLoading}
                />
              </View>
              <InputError msg={errors.nombre} />
            </View>

            {/* Apellido */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido</Text>
              <View style={[styles.inputContainer, errors.apellido ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="Pérez"
                  placeholderTextColor="#94A3B8"
                  value={apellido}
                  onChangeText={(val) => { setApellido(val); setErrors({ ...errors, apellido: '' }); }}
                  editable={!isLoading}
                />
              </View>
              <InputError msg={errors.apellido} />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="juan@ejemplo.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(val) => { setEmail(val); setErrors({ ...errors, email: '' }); }}
                  editable={!isLoading}
                />
              </View>
              <InputError msg={errors.email} />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => { setPassword(val); setErrors({ ...errors, password: '' }); }}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={isLoading}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
              <InputError msg={errors.password} />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(val) => { setConfirmPassword(val); setErrors({ ...errors, confirmPassword: '' }); }}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon} disabled={isLoading}>
                  <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
              <InputError msg={errors.confirmPassword} />
            </View>

            {/* Departamento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Departamento</Text>
              <View style={[styles.pickerContainer, errors.departamentoId ? styles.inputError : null]}>
                <Picker
                  selectedValue={departamentoId}
                  onValueChange={(val) => { setDepartamentoId(val); setErrors({ ...errors, departamentoId: '' }); }}
                  style={styles.picker}
                  enabled={!isLoading}
                  mode="dropdown"
                >
                  <Picker.Item label="Seleccione..." value="" color="#94A3B8" />
                  {departamentos.map(dep => (
                    <Picker.Item key={dep.id.toString()} label={dep.nombre} value={dep.id.toString()} color={COLORS.textDark} />
                  ))}
                </Picker>
              </View>
              <InputError msg={errors.departamentoId} />
            </View>

            {/* Municipio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Municipio</Text>
              <View style={[styles.pickerContainer, !departamentoId && styles.pickerDisabled, errors.municipioId ? styles.inputError : null]}>
                <Picker
                  selectedValue={municipioId}
                  onValueChange={(val) => { setMunicipioId(val); setErrors({ ...errors, municipioId: '' }); }}
                  style={styles.picker}
                  enabled={!!departamentoId && !isLoading}
                  mode="dropdown"
                >
                  <Picker.Item label="Seleccione..." value="" color="#94A3B8" />
                  {municipios.map(mun => (
                    <Picker.Item key={mun.id.toString()} label={mun.nombre} value={mun.id.toString()} color={COLORS.textDark} />
                  ))}
                </Picker>
              </View>
              <InputError msg={errors.municipioId} />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleRegister} 
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Crear cuenta</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/')} disabled={isLoading}>
            <Text style={styles.footerLink}>Inicia sesión aquí</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  headerIcon: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 8, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center' },
  form: { width: '100%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: '#FAFAFA', minHeight: 52, paddingHorizontal: 16 },
  inputError: { borderColor: COLORS.error, backgroundColor: '#FEF2F2' },
  input: { flex: 1, height: '100%', fontSize: 14, color: COLORS.textDark },
  eyeIcon: { padding: 8 },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4, fontWeight: '500' },
  pickerContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: '#FAFAFA', minHeight: 52, justifyContent: 'center', paddingVertical: Platform.OS === 'ios' ? 0 : 4 },
  picker: { width: '100%', ...Platform.select({ ios: { height: 150 }, android: { height: 52 } }) },
  pickerDisabled: { backgroundColor: COLORS.background },
  button: { backgroundColor: COLORS.primary, height: 50, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 16 },
  buttonDisabled: { backgroundColor: '#94A3B8' },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  footer: { backgroundColor: '#FAFAFA', paddingVertical: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderColor: COLORS.border },
  footerText: { color: COLORS.textLight, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
