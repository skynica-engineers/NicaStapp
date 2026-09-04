import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Cargar token y usuario al inicio
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@token');
        const storedUser = await AsyncStorage.getItem('@user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading auth data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Guardia de Rutas
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    
    // Rutas públicas que se pueden visitar sin token
    const isPublicRoute = inAuthGroup; 

    if (!token && !isPublicRoute) {
      // Redirigir al login si no está autenticado y trata de entrar a un área protegida
      router.replace('/login');
    } else if (token && inAuthGroup) {
      // Si está autenticado y trata de ir a login/register, redirigir al home
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading]);

  const login = async (newToken: string, newUser: User) => {
    try {
      await AsyncStorage.setItem('@token', newToken);
      await AsyncStorage.setItem('@user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Error saving auth data', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
