import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function TechHistorial() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.center}>
        <Feather name="clock" size={48} color="#94A3B8" style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Historial de Partidos</Text>
        <Text style={styles.desc}>Aquí aparecerán los partidos que ya has finalizado.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  desc: { fontSize: 14, color: '#64748B', textAlign: 'center' }
});
