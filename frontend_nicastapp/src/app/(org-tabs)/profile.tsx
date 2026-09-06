import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, Animated, DeviceEventEmitter } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useOrgContext } from '../../context/OrgContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function OrgProfileScreen() {
  const { activeOrg, switchToPersonal } = useOrgContext();
  const insets = useSafeAreaInsets();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@active_org');
      await switchToPersonal();
      DeviceEventEmitter.emit('onTokenExpired');
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  const handleSwitchToPersonal = async () => {
    setShowSwitcher(false);
    await switchToPersonal();
    router.replace('/(tabs)' as any);
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
          <Text style={styles.headerTitle}>Administración</Text>
        </View>

        {/* Profile Info with Switcher */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Feather name="shield" size={28} color={COLORS.white} />
            <View style={styles.activeIndicator} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{activeOrg?.nombre || 'Organización'}</Text>
            <Text style={styles.email}>{activeOrg?.tipo_institucion || 'Perfil Organizativo'}</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajustes de Organización</Text>
          <Text style={styles.sectionDesc}>Gestiona la información y miembros de tu liga</Text>
          
          <View style={styles.actionsGrid}>
            {renderActionCard('edit', 'Editar Información', 'Actualiza el nombre, logo y detalles', () => router.push('/organizaciones/edit'))}
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
              {/* Organization Account (Active) */}
              <TouchableOpacity style={[styles.accountItem, styles.accountItemActive]} disabled>
                <View style={styles.accountAvatar}>
                  <Feather name="shield" size={20} color={COLORS.white} />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{activeOrg?.nombre || 'Organización'}</Text>
                  <Text style={styles.accountType}>{activeOrg?.tipo_institucion || 'Perfil Organizativo'}</Text>
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

              {/* Switch back to personal */}
              <TouchableOpacity style={styles.accountItem} onPress={handleSwitchToPersonal}>
                <View style={[styles.accountAvatar, { backgroundColor: '#F1F5F9' }]}>
                  <Feather name="user" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>Mi Perfil Personal</Text>
                  <Text style={styles.accountType}>Cuenta de usuario</Text>
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </ScrollView>
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
});
