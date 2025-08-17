// src/app/notifications/enable/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { requestNotificationPermission } from "@/lib/firebase-messaging";
import { BellRing, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function EnableNotificationsPage() {
    const { user, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleEnable = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await requestNotificationPermission(user.uid);
            toast({
                title: "Success!",
                description: "Notifications have been enabled for this device.",
            });
            router.push('/profile');
        } catch (error) {
            console.error("Error enabling notifications:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not enable notifications. Please try again from your browser settings.",
            });
        } finally {
            setLoading(false);
        }
    };
    
    if (userData?.notificationToken) {
         return (
            <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                           <CheckCircle className="h-8 w-8 text-green-500"/>
                           Notifications Enabled
                        </CardTitle>
                        <CardDescription>
                           You are all set! You will receive notifications on this device.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                         <Button className="w-full" onClick={() => router.push('/profile')}>
                            Go to Profile
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <BellRing className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Enable Push Notifications</CardTitle>
                    <CardDescription>
                        Stay updated with the latest trends, messages, and account activity. Allow notifications to never miss out.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                        You'll be asked for permission in a browser pop-up. Please click "Allow".
                    </p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleEnable} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enable Notifications
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
