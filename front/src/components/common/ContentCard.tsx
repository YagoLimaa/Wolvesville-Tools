import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ContentCardProps {
  title: string;
  children: React.ReactNode;
}

export const ContentCard = ({ title, children }: ContentCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
