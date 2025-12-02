import { useMemo } from 'react';
import { Clan } from '@/components/ClanCard';

export type SortBy = 'xp' | 'members';
export type SortOrder = 'asc' | 'desc';
export type JoinType = 'all' | 'PUBLIC' | 'INVITE_ONLY' | 'CLOSED';

interface UseClanFiltersArgs {
  clans: Clan[] | null;
  localSearchTerm: string;
  joinType: JoinType;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export const useClanFilters = ({
  clans,
  localSearchTerm,
  joinType,
  sortBy,
  sortOrder,
}: UseClanFiltersArgs) => {

  const sortedResults = useMemo(() => {
    if (!clans) return [];
    
    const filtered = clans.filter(clan => 
      clan.name.toLowerCase().includes(localSearchTerm.toLowerCase()) &&
      (joinType === 'all' || clan.joinType === joinType)
    );

    return filtered.sort((a, b) => {
      const aValue = sortBy === 'xp' ? a.xp : a.memberCount;
      const bValue = sortBy === 'xp' ? b.xp : b.memberCount;

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [clans, localSearchTerm, joinType, sortBy, sortOrder]);

  return {
    sortedResults,
  };
};