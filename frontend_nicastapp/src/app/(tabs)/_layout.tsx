import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#0F3D91',
  textLight: '#64748B',
  white: '#FFFFFF',
  border: '#E2E8F0',
};

const AnimatedTabIcon = ({ focused, name, color }: { focused: boolean, name: any, color: any }) => {
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
  }, [focused]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View
        style={[
          styles.activeIconBackground,
          {
            transform: [{ scale }],
            opacity: scale.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          },
        ]}
      />
      <Feather name={name} size={24} color={focused ? COLORS.white : color} style={{ zIndex: 1 }} />
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            height: 60 + Math.max(insets.bottom, 10),
          }
        ],
        tabBarLabel: ({ focused, color, children }) => 
          focused ? <Text style={[styles.tabBarLabel, { color }]}>{children}</Text> : null,
        tabBarButton: (props) => <Pressable {...(props as any)} android_ripple={{ color: 'transparent' }} style={props.style as any} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => <AnimatedTabIcon focused={focused} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => <AnimatedTabIcon focused={focused} name="compass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, focused }) => <AnimatedTabIcon focused={focused} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="standings"
        options={{
          title: 'Tablas',
          tabBarIcon: ({ color, focused }) => <AnimatedTabIcon focused={focused} name="bar-chart-2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => <AnimatedTabIcon focused={focused} name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrapper: {
    width: 60,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  activeIconBackground: {
    position: 'absolute',
    width: 64, // wider pill shape
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 16, // perfect pill
  },
});
