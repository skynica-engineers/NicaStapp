import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { getMyOrganizaciones, getPerfil } from '../../services/api';
import { useOrgContext } from '../../context/OrgContext';
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

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [organizaciones, setOrganizaciones] = useState<any[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showAccreditations, setShowAccreditations] = useState(false);
  const { switchToOrg } = useOrgContext();
  const insets = useSafeAreaInsets();

  const spinValue = React.useRef(new Animated.Value(0)).current;

  const handleOpenSwitcher = () => {
    Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSwitcher(true);
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          const userData = await AsyncStorage.getItem('@user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            
            // Fetch updated profile and accreditations
            const fullProfile = await getPerfil(parsedUser.id);
            setUser(fullProfile || parsedUser);
            
            // Fetch user's organizations
            const userOrgs = await getMyOrganizaciones(parsedUser.id);
            setOrganizaciones(userOrgs);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingOrgs(false);
        }
      };
      loadData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('@active_org');
      
      router.replace('/login');
    } catch (e) {
      console.error('Error logging out:', e);
      // Fallback in case of error
      router.replace('/login');
    }
  };

  const handleSwitchOrg = async (org: any) => {
    setShowSwitcher(false);
    await switchToOrg({ id: org.id, nombre: org.nombre, tipo_institucion: org.tipo_institucion });
    router.replace('/(org-tabs)' as any);
  };

  const renderActionCard = (icon: any, title: string, subtitle: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Feather name={icon} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.actionInfo}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={24} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        {/* Profile Info with Switcher */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.nombreCompleto?.charAt(0) || 'U'}
            </Text>
            <View style={styles.activeIndicator} />
          </View>
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 8 }}>
              <Text style={[styles.name, { flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail">{user?.nombreCompleto || 'Usuario'}</Text>
            </View>
            <Text style={styles.email}>Perfil Personal</Text>
          </View>
          <TouchableOpacity 
            style={styles.switchButtonIcon} 
            onPress={handleOpenSwitcher}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Feather name="repeat" size={20} color={COLORS.primary} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Accreditations Section */}
        {user?.acreditaciones_mesa && user.acreditaciones_mesa.length > 0 && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Mis Acreditaciones Técnicas</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowAccreditations(!showAccreditations)}
                style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary }}>
                  {showAccreditations ? 'Ocultar' : 'Ver'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showAccreditations && Array.from(
              new Map(
                user.acreditaciones_mesa.map((a: any) => [`${a.organizacion_id}-${a.rol_acreditacion}`, a])
              ).values()
            ).map((acreditacion: any) => (
              <View key={acreditacion.id} style={[styles.actionCard, { marginTop: 10, padding: 12 }]}>
                <View style={[styles.actionIcon, { backgroundColor: acreditacion.estado_aprobacion === 'aprobado' ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Feather name="award" size={20} color={acreditacion.estado_aprobacion === 'aprobado' ? COLORS.success : COLORS.error} />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>{acreditacion.rol_acreditacion.charAt(0).toUpperCase() + acreditacion.rol_acreditacion.slice(1)}</Text>
                  <Text style={styles.actionSubtitle}>{acreditacion.organizaciones?.nombre}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: acreditacion.estado_aprobacion === 'aprobado' ? COLORS.success : COLORS.error }}>
                  {acreditacion.estado_aprobacion.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Dashboard Access for Roles (REQ-USR-04) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitudes y Gestión</Text>
          <Text style={styles.sectionDesc}>Amplía tu participación en la plataforma</Text>
          
          <View style={styles.actionsGrid}>
            {renderActionCard('briefcase', 'Crear Organización', 'Registra tu liga o comisión', () => router.push('/organizaciones/create'))}
            {renderActionCard('shield', 'Mis Equipos', 'Registra o administra tu equipo', () => router.push('/(equipos)'))}
            {renderActionCard('award', 'Acreditación Técnica', 'Solicita perfil de árbitro o anotador', () => router.push('/acreditacion/create'))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Account Switcher Modal (Bottom Sheet) */}
      <Modal
        visible={showSwitcher}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSwitcher(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSwitcher(false)}>
          <Pressable style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 24) }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Cambiar de cuenta</Text>
            
            <ScrollView style={styles.accountsList}>
              {/* Personal Account (Active) */}
              <TouchableOpacity style={[styles.accountItem, styles.accountItemActive]} disabled>
                <View style={styles.accountAvatar}>
                  <Text style={styles.accountAvatarText}>{user?.nombreCompleto?.charAt(0) || 'U'}</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{user?.nombreCompleto || 'Usuario'}</Text>
                  <Text style={styles.accountType}>Perfil Personal</Text>
                </View>
                <Feather name="check-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>

              {/* Perfil Técnico */}
              {user?.acreditaciones_mesa?.some((a: any) => a.estado_aprobacion === 'aprobado') && (
                <TouchableOpacity 
                  style={styles.accountItem}
                  onPress={() => {
                    setShowSwitcher(false);
                    router.push('/(tech-tabs)');
                  }}
                >
                  <View style={[styles.accountAvatar, { backgroundColor: '#F3E8FF' }]}>
                    <Feather name="award" size={20} color="#9333EA" />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>Mesa Técnica</Text>
                    <Text style={styles.accountType}>Anotador / Juez</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}

              {/* Organization Accounts */}
              {isLoadingOrgs ? (
                <View style={{ paddingHorizontal: 16 }}>
                  {[1, 2].map(i => (
                    <View key={i} style={[styles.accountItem, { borderWidth: 0, paddingHorizontal: 0 }]}>
                      <Skeleton width={48} height={48} borderRadius={12} />
                      <View style={[styles.accountInfo, { marginLeft: 12 }]}>
                        <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
                        <Skeleton width="40%" height={12} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                organizaciones.map((org) => (
                  <TouchableOpacity 
                    key={org.id} 
                    style={styles.accountItem}
                    onPress={() => handleSwitchOrg(org)}
                  >
                    <View style={[styles.accountAvatar, { backgroundColor: '#F1F5F9' }]}>
                      <Feather name="shield" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{org.nombre}</Text>
                      <Text style={styles.accountType}>{org.tipo_institucion}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))
              )}

              {organizaciones.length === 0 && !isLoadingOrgs && (
                <View style={styles.emptyOrgs}>
                  <Feather name="info" size={20} color={COLORS.textLight} style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyOrgsText}>No administras ninguna organización</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.createOrgBtn} onPress={() => {
              setShowSwitcher(false);
              router.push('/organizaciones/create');
            }}>
              <Feather name="plus" size={18} color={COLORS.primary} />
              <Text style={styles.createOrgText}>Crear nueva organización</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textDark },
  
  profileHeader: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, 
    marginHorizontal: 20, marginBottom: 32, backgroundColor: COLORS.white, 
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: '700', color: COLORS.white },
  activeIndicator: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.white },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  email: { fontSize: 13, color: COLORS.textLight, fontWeight: '500' },
  switchButtonIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },

  section: { paddingHorizontal: 20, marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  sectionDesc: { fontSize: 14, color: COLORS.textLight, marginBottom: 16 },
  actionsGrid: { gap: 12 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  actionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textDark, marginBottom: 2 },
  actionSubtitle: { fontSize: 12, color: COLORS.textLight },
  
  logoutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16, justifyContent: 'center', marginTop: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.error, marginLeft: 8 },

  // Bottom Sheet Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 16, textAlign: 'center' },
  accountsList: { marginBottom: 16 },
  accountItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  accountItemActive: { backgroundColor: '#F8FAFC', borderColor: COLORS.primary },
  accountAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  accountAvatarText: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  accountInfo: { flex: 1, paddingRight: 8 },
  accountName: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 2 },
  accountType: { fontSize: 12, color: COLORS.textLight },
  emptyOrgs: { padding: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  emptyOrgsText: { color: COLORS.textLight, fontSize: 13, textAlign: 'center' },
  
  createOrgBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#EFF6FF', borderRadius: 16, gap: 8 },
  createOrgText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
});
