import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

// Remove custom ImportMetaEnv and ImportMeta interfaces, Vite provides these types globally.

export interface Role {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  team: string;
  aura: string;
  [key: string]: unknown;
}

interface RolesContextType {
  allRoles: Role[];
  rolesById: Map<string, Role>;
  isLoading: boolean;
  isError: boolean;
}

const RolesContext = React.createContext<RolesContextType | undefined>(undefined);

const fetchAllRoles = async (): Promise<Role[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/roles`);
  if (!response.ok) {
    throw new Error('Não foi possível buscar a lista de roles do backend.');
  }
  return response.json();
};

export const RolesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: allRoles = [], isLoading, isError } = useQuery<Role[]>({
    queryKey: ['allRolesGlobal'],
    queryFn: fetchAllRoles,
    staleTime: 1000 * 60 * 60, // Cache de 1 hora
    refetchOnWindowFocus: false,
  });

  const rolesById = React.useMemo(() => {
    const map = new Map<string, Role>();
    for (const role of allRoles) {
      if (role.id) {
        map.set(role.id, role);
      }
    }
    return map;
  }, [allRoles]);

  const value = { allRoles, rolesById, isLoading, isError };

  return (
    <RolesContext.Provider value={value}>
      {children}
    </RolesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRoles = (): RolesContextType => {
  const context = React.useContext(RolesContext);
  if (context === undefined) {
    throw new Error('useRoles deve ser usado dentro de um RolesProvider');
  }
  return context;
};