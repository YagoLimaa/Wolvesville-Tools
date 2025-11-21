import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { announcementsApi } from '@/lib/api';

interface Attachment {
  url: string;
  width: number;
  height: number;
}

interface Announcement {
  content: string;
  timestamp: string;
  attachments: Attachment[];
  author: {
    username: string;
  };
}

const fetchAnnouncements = async (): Promise<{ announcements: Announcement[] }> => {
  const response = await announcementsApi.getAll();
  if (response.error) {
    throw new Error('Não foi possível buscar os anúncios.');
  }

  const responseData = response.data;
  if (Array.isArray(responseData)) {
    return { announcements: responseData as Announcement[] };
  }

  if (typeof responseData === 'object' && responseData !== null && 'announcements' in responseData) {
    const announcementsData = (responseData as { announcements: unknown }).announcements;
    if (Array.isArray(announcementsData)) {
      return { announcements: announcementsData as Announcement[] };
    }
  }
  
  return { announcements: [] }; // Return empty array if data is not in expected format
};

export const AnnouncementsViewer = () => {
  const { data, isLoading, isError, error } = useQuery<{ announcements: Announcement[] }, Error>({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
    staleTime: 1000 * 60 * 15, // Cache de 15 minutos
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {data?.announcements.map((ann, index) => (
        <div key={index} className="p-4 border-b border-border last:border-b-0">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ann.author.username}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(ann.timestamp), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap mb-3">{ann.content}</p>
          {ann.attachments && ann.attachments.length > 0 && (
            <div className="space-y-2">
              {ann.attachments.map((att, attIndex) => (
                <img
                  key={attIndex}
                  src={att.url}
                  alt="Anexo do anúncio"
                  className="rounded-md max-w-full h-auto"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};