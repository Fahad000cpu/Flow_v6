
// src/components/notifications.tsx
"use client";

import { useState, useEffect } from "react";
import { Bell, Heart, MessageSquare, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, limit, Timestamp, writeBatch, where, getDocs, doc } from "firebase/firestore";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";

type Notification = {
    id: string;
    fromUserName: string;
    fromUserAvatar: string;
    message: string;
    type: "like" | "comment" | "new_status" | "new_message";
    entityId: string;
    timestamp: Timestamp;
    isRead: boolean;
}

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const notifsRef = collection(db, "users", user.uid, "notifications");
    const q = query(
        notifsRef,
        orderBy("timestamp", "desc"),
        limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(notifList);
        const unread = notifList.filter(n => !n.isRead).length;
        setUnreadCount(unread);
    }, (error) => {
        console.error("Error fetching notifications:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async () => {
    if (!user || unreadCount === 0) return;

    const notifsRef = collection(db, "users", user.uid, "notifications");
    const q = query(notifsRef, where("isRead", "==", false));
    
    try {
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach(docSnapshot => {
            const docRef = doc(db, "users", user.uid, "notifications", docSnapshot.id);
            batch.update(docRef, { isRead: true });
        });
        await batch.commit();
    } catch(error) {
        console.error("Error marking notifications as read:", error);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case "like": return <Heart className="h-4 w-4 text-red-500" />;
      case "comment": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "new_status": return <ImageIcon className="h-4 w-4 text-green-500" />;
      case "new_message": return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  }

  const getLink = (notification: Notification) => {
    switch (notification.type) {
        case 'new_message':
            return `/chat/${notification.entityId}`;
        case 'like':
        case 'comment':
        case 'new_status':
            return `/status`; // Or a more specific link if available
        default:
            return '#';
    }
  }

  return (
    <DropdownMenu onOpenChange={(isOpen) => {
        if (isOpen) {
            handleMarkAsRead();
        }
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No new notifications.</p>
        ) : (
            notifications.map(notif => (
                <DropdownMenuItem key={notif.id} asChild className="cursor-pointer">
                    <Link href={getLink(notif)} className="flex items-start gap-3 p-2">
                        <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={notif.fromUserAvatar} />
                            <AvatarFallback>{notif.fromUserName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm">
                                <span className="font-semibold">{notif.fromUserName}</span> {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notif.timestamp.toDate(), { addSuffix: true })}
                            </p>
                        </div>
                        {getIcon(notif.type)}
                    </Link>
                </DropdownMenuItem>
            ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
