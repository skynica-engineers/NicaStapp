import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEquiposByUsuario } from '../../services/api';
import { Skeleton } from '../../components/SkeletonLoader';

const COLORS = {
  primary: '#0F3D91',
  secondary: '#3B82F6',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
};

export default function MisEquipos() {
  const router = useRouter();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchEquipos = async () => {
        try {
          const userData = await AsyncStorage.getItem('@user');
          if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            const response = await getEquiposByUsuario(parsed.id);
            setEquipos(response);
          }
        } catch (error) {
          console.error('Error fetching equipos:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchEquipos();
    }, [])
  );

  const renderEquipo = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(equipos)/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Feather name="shield" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardSubtitle}>{item.deportes?.nombre}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={COLORS.textLight} />
      </View>
      <View style={styles.cardFooter}>
        <Feather name="map-pin" size={14} color={COLORS.textLight} />
        <Text style={styles.footerText}>
          {item.comunidades?.nombre}, {item.comunidades?.municipios?.nombre}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Equipos</Text>
      </View>

      {loading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                  <Skeleton width="40%" height={12} />
                </View>
                <Skeleton width={20} height={20} borderRadius={10} />
              </View>
              <View style={[styles.cardFooter, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 4 }]}>
                <Skeleton width="70%" height={14} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={equipos}
          keyExtractor={(item: any) => item.id}
          renderItem={renderEquipo}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="shield-off" size={48} color={COLORS.textLight} />
              </View>
              <Text style={styles.emptyTitle}>Aún no tienes equipos</Text>
              <Text style={styles.emptyDesc}>Crea tu primer equipo para administrar tu plantilla e inscribirte en torneos.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/(equipos)/crear')}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color={COLORS.white} />
        <Text style={styles.fabText}>Nuevo Equipo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  }
});
