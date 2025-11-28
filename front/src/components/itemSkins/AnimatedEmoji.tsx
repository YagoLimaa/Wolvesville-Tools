import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import Lottie from "lottie-react";
import { Skeleton } from "@/components/ui/skeleton";

export const AnimatedEmoji = ({ urlAnimation, onError }: { urlAnimation: string; onError: () => void; }) => {
  const { data: animationData, isLoading } = useQuery({
    queryKey: ['emojiAnimation', urlAnimation],
    queryFn: async () => {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(urlAnimation)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      if (data.proxyError) {
        return null;
      }
      return data;
    },
    staleTime: Infinity,
    retry: false,
  });

  React.useEffect(() => {
    if (!isLoading && !animationData) {
      onError();
    }
  }, [isLoading, animationData, onError]);

  if (isLoading) return <Skeleton className="w-full h-full" />;
  if (!animationData) return null;

  return <Lottie animationData={animationData} loop={true} className="w-full h-full" />;
};
