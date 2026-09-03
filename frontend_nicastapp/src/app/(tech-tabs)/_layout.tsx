import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React from 'react';

export default function TechTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#9333EA', // Purple for Technical Profile
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: '#FFFFFF',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mis Partidos',
          tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <Feather name="clock" size={24} color={color} />,
        }}
      />
      {/* Hide specific match screen from tabs */}
      <Tabs.Screen
        name="encuentro/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
