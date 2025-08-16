// src/components/client-layout.tsx
"use client";

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/bottom-nav";
import { PermissionsDialog } from "@/components/permissions-dialog";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { FirebaseMessagingProvider } from "@/context/firebase-messaging-context";
import { PageLoader } from "@/components/page-loader";

function PageTransitionHandler({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // This effect will be triggered when the pathname changes,
  // which means the new page has started to render. We hide the loader.
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  // This effect sets up a listener for clicks on anchor tags (`<a>`)
  // to show the loader *before* the navigation starts.
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        // Find the closest anchor tag, even if the click is on an element inside it
        const anchor = target.closest('a');

        // Check if the link is internal, not a special link (like `_blank`),
        // and not just a hash link on the same page.
        if (anchor && anchor.href && anchor.target !== '_blank' && new URL(anchor.href).origin === window.location.origin) {
             const currentPath = window.location.pathname;
             const newPath = new URL(anchor.href).pathname;
             if(currentPath !== newPath) {
                setIsLoading(true);
             }
        }
    };

    document.addEventListener('click', handleAnchorClick);

    // Clean up the event listener when the component unmounts
    return () => {
        document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <>
      <PageLoader isLoading={isLoading} />
      {children}
    </>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={["light", "dark", "rainbow"]}
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <FirebaseMessagingProvider>
              <PageTransitionHandler>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1 pb-20 md:pb-0">
                    {children}
                  </main>
                  <div className="md:hidden">
                    <BottomNav />
                  </div>
                </div>
                <Toaster />
                <PermissionsDialog />
              </PageTransitionHandler>
            </FirebaseMessagingProvider>
          </AuthProvider>
        </ThemeProvider>
    )
}
