import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

// A API retorna a imagem dentro de um objeto 'image'
interface RoleFromApi {
  id: string;
  name: string;
  description: string;
  team: string;
  aura: string;
  image: { url: string };
  [key: string]: unknown;
}

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
  const response = await fetch('/api/roles');
  if (!response.ok) {
    throw new Error('Não foi possível buscar a lista de roles do backend.');
  }
  const data: { roles: RoleFromApi[] } = await response.json();
  
  // Transforma os dados da API para o formato que o frontend espera
  return data.roles.map(role => ({
    ...role,
    imageUrl: role.image.url, // Extrai a URL da imagem
  }));
};

interface RolesProviderProps {
  children: React.ReactNode;
}

export const RolesProvider = ({ children }: RolesProviderProps) => {
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