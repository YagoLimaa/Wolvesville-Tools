import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { announcementsApi } from '@/lib/api';

interface Changelog {
  content: string;
  timestamp: string;
  author: {
    username: string;
  };
}

const fetchChangelogs = async (): Promise<{ changelogs: Changelog[] }> => {
  const response = await announcementsApi.getAll();
  if (response.error) {
    throw new Error('Não foi possível buscar os changelogs.');
  }
  const announcements = Array.isArray(response.data) ? response.data as Changelog[] : (response.data as { announcements: Changelog[] })?.announcements || [];
  return { changelogs: announcements };
};

export const ChangelogViewer = () => {
  const { data, isLoading, isError, error } = useQuery<{ changelogs: Changelog[] }, Error>({
    queryKey: ["changelogs"],
    queryFn: fetchChangelogs,
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
      {data?.changelogs.map((log, index) => (
        <div key={index} className="p-4 border-b border-border last:border-b-0">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> {log.author.username}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                img: ({ ...props }) => (
                  <img
                    className="w-7 h-7 inline-block align-middle my-0 mx-1"
                    {...props}
                  />
                ),
              }}
            >
              {log.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};