import React from 'react';
import { Stack } from 'expo-router';

export default function EquiposLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Mis Equipos',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="crear" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Perfil del Equipo',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
