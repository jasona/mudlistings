import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Header } from './header';
import { Footer } from './footer';
import { useCurrentUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { setIsLoading } = useAuthStore();
  const { isLoading: isUserLoading } = useCurrentUser();

  useEffect(() => {
    setIsLoading(isUserLoading);
  }, [isUserLoading, setIsLoading]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
