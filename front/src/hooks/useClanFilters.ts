import { useState, useMemo } from 'react';
import { Clan } from '@/components/ClanCard';

export type SortBy = 'xp' | 'members';
export type SortOrder = 'asc' | 'desc';
export type JoinType = 'all' | 'PUBLIC' | 'INVITE_ONLY' | 'CLOSED';

export const useClanFilters = (clans: Clan[] | null) => {
  const [language, setLanguage] = useState("all");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("xp");
  const [joinType, setJoinType] = useState<JoinType>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

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
    // Filter State
    language,
    setLanguage,
    localSearchTerm,
    setLocalSearchTerm,
    sortBy,
    setSortBy,
    joinType,
    setJoinType,
    sortOrder,
    toggleSortOrder,
    // Derived Data
    sortedResults,
  };
};