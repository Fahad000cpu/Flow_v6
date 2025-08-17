// src/components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserCircle, MessageSquare, Shield, Camera, Link2, FileText, Share2, Copy, Star, Users, Sparkles, LogIn, LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { user, userData, signOut, isAdmin } = useAuth();
  
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/status", label: "Status", icon: Camera },
    { href: "/chat", label: "Chat", icon: MessageSquare, auth: true },
    { href: "/ai-chat", label: "AI Chat", icon: Sparkles, auth: true },
    { href: "/chat/create-group", label: "Create Group", icon: Users, auth: true },
    { href: "/profile", label: "Profile", icon: UserCircle, auth: true },
    { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
    { href: "/terms", label: "Terms", icon: FileText },
    { href: "/privacy", label: "Privacy", icon: FileText },
    { href: "https://browserleaks.com/ip", label: "Check IP", icon: Link2, external: true },
    { href: "https://amropedia.wordpress.com", label: "Ad Website", icon: Star, external: true },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast({
      title: "Link Copied!",
      description: "The app link has been copied to your clipboard.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Flow",
          text: "Check out AI Flow, where you can discover and share amazing products!",
          url: window.location.origin,
        });
      } catch (error) {
        // We can ignore abort errors as they happen when the user closes the share sheet.
        if ((error as Error).name !== 'AbortError') {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      handleCopyLink();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
           <Image src="/icon.svg" alt="AI Flow Logo" width={24} height={24} />
          <span className="font-bold text-lg">AI Flow</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share App</span>
        </Button>
      </div>
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {navLinks.map(({ href, label, icon: Icon, external, adminOnly, auth: authRequired }) => {
            if (adminOnly && !isAdmin) return null;
            if (authRequired && !user) return null;

            const isActive = !external && (href === "/" ? pathname === href : pathname.startsWith(href));
            const linkContent = (
              <>
                <Icon className="h-4 w-4" />
                {label}
              </>
            );

            if (external) {
              return (
                 <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                      {linkContent}
                    </a>
                  </li>
              )
            }

            return (
              <li key={label}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary"
                  )}
                >
                  {linkContent}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

       {user && (
         <div className="p-2 border-t">
            {!userData?.notificationToken && (
               <Button variant="ghost" className="w-full justify-start text-primary" asChild>
                <Link href="/notifications/enable">
                  <Bell className="mr-2 h-4 w-4" />
                  Enable Notifications
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-2 p-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={userData?.avatarUrl} alt={userData?.name} />
                    <AvatarFallback>{userData?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{userData?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                 <Button variant="ghost" size="icon" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                 </Button>
            </div>
         </div>
       )}

      <div className="mt-auto p-4 border-t">
         {user ? (
            <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/auth/signin">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
      </div>
    </div>
  );
}
