import React, { useEffect, useRef } from 'react';
import { Tabs, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform, Animated, Pressable, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgContext } from '../../context/OrgContext';

const ORG_COLORS = {
  primary: '#0F3D91',
  textLight: '#64748B',
  white: '#FFFFFF',
  border: '#E2E8F0',
  error: '#EF4444',
};

const AnimatedOrgTabIcon = ({ focused, name, color }: { focused: boolean; name: React.ComponentProps<typeof Feather>['name']; color: string }) => {
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
    <View style={iconStyles.wrapper}>
      <Animated.View
        style={[
          iconStyles.activeBg,
          {
            transform: [{ scale }],
            opacity: scale.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          },
        ]}
      />
      <Feather name={name} size={24} color={focused ? ORG_COLORS.white : color} style={{ zIndex: 1 }} />
    </View>
  );
};

export default function OrgTabLayout() {
  const insets = useSafeAreaInsets();
  const { activeOrg } = useOrgContext();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ORG_COLORS.primary,
        tabBarInactiveTintColor: ORG_COLORS.textLight,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            height: 60 + Math.max(insets.bottom, 10),
          },
        ],
        tabBarLabel: ({ focused, color, children }) =>
          focused ? <Text style={[styles.tabBarLabel, { color }]}>{children}</Text> : null,
        tabBarButton: (props) => (
          <Pressable {...(props as any)} android_ripple={{ color: 'transparent' }} style={props.style as any} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Panel',
          tabBarIcon: ({ color, focused }) => <AnimatedOrgTabIcon focused={focused} name="home" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="torneos"
        options={{
          title: 'Torneos',
          tabBarIcon: ({ color, focused }) => <AnimatedOrgTabIcon focused={focused} name="award" color={color as string} />,
        }}
      />

      <Tabs.Screen
        name="acreditaciones"
        options={{
          title: 'Técnicos',
          tabBarIcon: ({ color, focused }) => <AnimatedOrgTabIcon focused={focused} name="users" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="comunicados"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ color, focused }) => <AnimatedOrgTabIcon focused={focused} name="message-square" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Organizar',
          tabBarIcon: ({ color, focused }) => <AnimatedOrgTabIcon focused={focused} name="settings" color={color as string} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: ORG_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: ORG_COLORS.border,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});

const iconStyles = StyleSheet.create({
  wrapper: {
    width: 60,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  activeBg: {
    position: 'absolute',
    width: 64,
    height: 32,
    backgroundColor: ORG_COLORS.primary,
    borderRadius: 16,
  },
  exitWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  exitIconBg: {
    width: 60,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
});
