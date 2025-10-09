import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, Star, Calendar, ShieldCheck, Languages, AlertCircle, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Button } from "@/components/ui/button";

// Define the types for the clan data
interface ClanMember {
  id: string;
  username: string;
  level: number;
  isCoLeader?: boolean;
  equippedAvatar?: {
    url: string;
  };
}

interface ClanInfoData {
  id: string;
  name: string;
  description: string;
  xp: number;
  language: string;
  icon: string;
  tag: string;
  joinType: string;
  creationTime: string;
  minLevel: number;
  memberCount: number;
  members: ClanMember[];
}

// Type guard to check if the data is valid ClanInfoData
function isClanInfoData(data: unknown): data is ClanInfoData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    typeof (data as ClanInfoData).id === 'string' &&
    typeof (data as ClanInfoData).name === 'string'
  );
}

const fetchClanInfo = async (clanId: string): Promise<ClanInfoData> => {
  const { data } = await axios.get(`/api/clan/${clanId}`);
  if (isClanInfoData(data)) {
    return data;
  }
  throw new Error("Invalid clan data received from server.");
};

const ClanInfoPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: clan, isLoading, isError, error } = useQuery<ClanInfoData, Error>({
    queryKey: ["clanInfo", id],
    queryFn: () => fetchClanInfo(id!),
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatJoinType = (joinType: string) => {
    switch (joinType) {
      case 'JOIN_BY_REQUEST':
        return t('clanInfo.joinByRequest');
      case 'JOIN_OPEN':
        return t('clanInfo.open');
      case 'JOIN_CLOSED':
        return t('clanInfo.closed');
      default:
        return joinType;
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div>
          <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-24 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      );
    }
  
    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>{error?.message || t('clanInfo.fetchError')}</AlertDescription>
        </Alert>
      );
    }
  
    if (!clan) {
      return null;
    }
  
    // Sort members: Leader, Co-Leaders, then by XP/Level (assuming level is available)
    const sortedMembers = [...clan.members].sort((a, b) => {
      const getRoleValue = (m: ClanMember, index: number) => {
        if (index === 0) return 0; // Leader is always first in API response
        if (m.isCoLeader) return 1;
        return 2;
      };
      const roleA = getRoleValue(a, clan.members.indexOf(a));
      const roleB = getRoleValue(b, clan.members.indexOf(b));
      if (roleA !== roleB) return roleA - roleB;
      return b.level - a.level; // Sort by level for members with the same role
    });
  
  
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center border-b border-border/50 pb-6">
          <div className="flex justify-center items-center gap-4 mb-2">
            <span className="text-5xl">{clan.tag}</span>
            <CardTitle className="text-4xl sm:text-5xl font-bold text-primary tracking-tighter">
              {clan.name}
            </CardTitle>
          </div>
          <p className="text-muted-foreground italic whitespace-pre-wrap max-w-2xl mx-auto">
            {clan.description}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8 text-center">
            <Card className="p-3 bg-secondary/50">
              <Star className="mx-auto mb-2 h-6 w-6 text-yellow-400" />
              <p className="text-sm text-muted-foreground">{t('common.xp')}</p>
              <p className="text-lg font-bold">{clan.xp.toLocaleString()}</p>
            </Card>
            <Card className="p-3 bg-secondary/50">
              <Users className="mx-auto mb-2 h-6 w-6 text-blue-400" />
              <p className="text-sm text-muted-foreground">{t('clanCard.members')}</p>
              <p className="text-lg font-bold">{clan.memberCount}</p>
            </Card>
            <Card className="p-3 bg-secondary/50">
              <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-green-400" />
              <p className="text-sm text-muted-foreground">{t('clanInfo.minLevel')}</p>
              <p className="text-lg font-bold">{clan.minLevel}</p>
            </Card>
             <Card className="p-3 bg-secondary/50">
              <Languages className="mx-auto mb-2 h-6 w-6 text-purple-400" />
              <p className="text-sm text-muted-foreground">{t('clanInfo.language')}</p>
              <p className="text-lg font-bold">{clan.language}</p>
            </Card>
            <Card className="p-3 bg-secondary/50">
              <Calendar className="mx-auto mb-2 h-6 w-6 text-orange-400" />
              <p className="text-sm text-muted-foreground">{t('clanInfo.creationDate')}</p>
              <p className="text-lg font-bold">{formatDate(clan.creationTime)}</p>
            </Card>
            <Card className="p-3 bg-secondary/50">
              <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-cyan-400" />
              <p className="text-sm text-muted-foreground">{t('clanInfo.joinType')}</p>
              <p className="text-lg font-bold">{formatJoinType(clan.joinType)}</p>
            </Card>
          </div>

          <h3 className="text-2xl font-bold text-center mb-4">{t('clanCard.clanMembers')}</h3>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead>{t('playerCard.username')}</TableHead>
                  <TableHead>{t('playerCard.level')}</TableHead>
                  <TableHead>{t('clanInfo.role')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <img src={member.equippedAvatar?.url || 'https://via.placeholder.com/40'} alt={member.username} className="w-10 h-10 rounded-full object-cover" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/search?username=${encodeURIComponent(member.username)}`} className="hover:underline">
                        {member.username}
                      </Link>
                    </TableCell>
                    <TableCell>{member.level}</TableCell>
                    <TableCell>
                      {index === 0 ? t('clanCard.leader') : member.isCoLeader ? t('clanCard.coLeader') : t('clanCard.member')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        {renderContent()}
      </main>
    </div>
  );
};

export default ClanInfoPage;