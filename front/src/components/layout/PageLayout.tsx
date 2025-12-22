import { NavigationBar } from "@/components/ui/navigation-bar";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const PageLayout = ({ children, title }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-28 py-8">
        {title && (
          <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
            {title}
          </h1>
        )}
        {children}
      </main>
    </div>
  );
};
