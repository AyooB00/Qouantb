'use client'

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  // Check if we're on the landing page (with or without locale prefix)
  const isLandingPage = pathname === '/' || pathname === '/en' || pathname === '/ar';
  const showSidebar = !isLandingPage;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {showSidebar ? (
        // Dashboard pages with sidebar
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col h-screen overflow-hidden">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
              </div>
            </header>
            <div className={`flex-1 overflow-hidden ${pathname === '/finchat' ? '' : 'px-6 py-8 lg:px-8 overflow-y-auto'}`}>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        // Landing page layout without sidebar
        <main className="min-h-screen">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      )}
      <Toaster richColors position="bottom-right" />
    </ThemeProvider>
  );
}