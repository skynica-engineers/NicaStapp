import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { apiCall } from '../services/api';
import { useAuth } from '../context/AuthContext';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    let valid = true;

    if (!email) {
      setEmailError('El correo es obligatorio');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Ingresa un correo válido');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (valid) {
      setIsLoading(true);
      try {
        const result = await apiCall('/auth/login', 'POST', {
          email,
          password,
        });
        
        // Save token and user data via AuthContext
        if (result.token && result.user) {
          await login(result.token, result.user);
        }
        
        // Redirect to Home is handled by the AuthContext guard automatically,
        // but we can enforce it just in case:
        router.replace('/(tabs)');
      } catch (error: any) {
        const errorMsg = error.message || '';
        
        if (errorMsg.includes('fetch failed') || errorMsg.includes('Network request failed') || errorMsg.includes('ConnectException')) {
          Alert.alert('Problema de conexión', 'No se pudo conectar al servidor. Verifica tu conexión a internet o intenta más tarde.');
        } else if (errorMsg.includes('Credenciales') || errorMsg.includes('Usuario') || errorMsg.includes('Contraseña') || errorMsg.includes('inválidas')) {
          setEmailError('Credenciales incorrectas');
          setPasswordError('Credenciales incorrectas');
        } else {
          Alert.alert('Error', errorMsg);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.scrollWrapper}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Image
                source={require('../../assets/images/logo.svg')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.subtitle}>
                Bienvenido de nuevo al ecosistema{'\n'}deportivo de alto rendimiento.
              </Text>
            </View>

            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                  <Feather name="mail" size={20} color={COLORS.textLight} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="tu@correo.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                  <Feather name="lock" size={20} color={COLORS.textLight} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                  />
                  <TouchableOpacity disabled={isLoading} onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity disabled={isLoading} style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleLogin} 
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Iniciar sesión</Text>
                    <Feather name="arrow-right" size={20} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
                <TouchableOpacity disabled={isLoading} onPress={() => router.push('/register')}>
                  <Text style={styles.registerLink}>Registrarse</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Gradients to fade out top and bottom */}
          <LinearGradient
            colors={[COLORS.white, 'rgba(255,255,255,0)']}
            style={styles.topGradient}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(255,255,255,0)', COLORS.white]}
            style={styles.bottomGradient}
            pointerEvents="none"
          />
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
  scrollWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.textDark,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
