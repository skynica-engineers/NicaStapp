import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ORG_STORAGE_KEY = '@active_org';

export interface ActiveOrg {
  id: string;
  nombre: string;
  tipo_institucion: string;
}

interface OrgContextType {
  activeContext: 'personal' | 'organization';
  activeOrg: ActiveOrg | null;
  switchToOrg: (org: ActiveOrg) => Promise<void>;
  switchToPersonal: () => Promise<void>;
  isRestoring: boolean;
}

const OrgContext = createContext<OrgContextType>({
  activeContext: 'personal',
  activeOrg: null,
  switchToOrg: async () => {},
  switchToPersonal: async () => {},
  isRestoring: true,
});

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [activeContext, setActiveContext] = useState<'personal' | 'organization'>('personal');
  const [activeOrg, setActiveOrg] = useState<ActiveOrg | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore from AsyncStorage on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(ORG_STORAGE_KEY);
        if (stored) {
          const org = JSON.parse(stored) as ActiveOrg;
          setActiveOrg(org);
          setActiveContext('organization');
        }
      } catch (e) {
        console.error('Error restoring org context:', e);
      } finally {
        setIsRestoring(false);
      }
    };
    restore();
  }, []);

  const switchToOrg = useCallback(async (org: ActiveOrg) => {
    await AsyncStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(org));
    setActiveOrg(org);
    setActiveContext('organization');
  }, []);

  const switchToPersonal = useCallback(async () => {
    await AsyncStorage.removeItem(ORG_STORAGE_KEY);
    setActiveOrg(null);
    setActiveContext('personal');
  }, []);

  return (
    <OrgContext.Provider value={{ activeContext, activeOrg, switchToOrg, switchToPersonal, isRestoring }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrgContext = () => useContext(OrgContext);
