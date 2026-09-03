import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { OrgProvider } from '../context/OrgContext';
import { syncService } from '../services/syncService';

export default function Layout() {
  useEffect(() => {
    // Escuchar cambios de conexión
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncService.processQueue();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <OrgProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(org-tabs)" />
        </Stack>
      </OrgProvider>
    </SafeAreaProvider>
  );
}
