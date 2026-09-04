import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyOrganizaciones } from '../../services/api';

const COLORS = {
  primary: '#0F3D91',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export default function MyOrganizationsScreen() {
  const insets = useSafeAreaInsets();
  const [organizaciones, setOrganizaciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          const userOrgs = await getMyOrganizaciones(parsedUser.id);
          setOrganizaciones(userOrgs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/LogoSinFondo.png')} 
            style={{ width: 32, height: 32 }} 
            contentFit="contain" 
          />
          <Text style={styles.logoText}>NICASTAPP</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.screenTitle}>Mis Organizaciones</Text>
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : organizaciones.length > 0 ? (
          organizaciones.map((org: any) => (
            <TouchableOpacity 
              key={org.id} 
              style={styles.orgCard}
              onPress={() => router.push(`/organizaciones/${org.id}`)}
            >
              <View style={styles.orgIconContainer}>
                <Feather name="shield" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.orgInfo}>
                <Text style={styles.orgName}>{org.nombre}</Text>
                <Text style={styles.orgSubtitle}>{org.tipo_institucion}</Text>
                {org.municipios?.nombre && (
                  <Text style={styles.orgLocation}>
                    <Feather name="map-pin" size={12} color={COLORS.textLight} /> {org.municipios.nombre}
                  </Text>
                )}
              </View>
              <Feather name="chevron-right" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No tienes organizaciones creadas.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 12 },
  logoText: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginLeft: 8, letterSpacing: 0.5 },
  screenTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textDark, marginBottom: 20 },
  container: { padding: 20 },
  orgCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  orgIconContainer: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  orgInfo: { flex: 1 },
  orgName: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  orgSubtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  orgLocation: { fontSize: 12, color: COLORS.textLight },
  emptyText: { color: COLORS.textLight, textAlign: 'center', marginTop: 40, fontStyle: 'italic' },
});
