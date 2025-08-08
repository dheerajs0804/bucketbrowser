"use client";

import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const { signinCallback } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleSigninCallback = async () => {
        try {
            await signinCallback();
            router.replace('/dashboard');
        } catch (error) {
            console.error("Authentication callback failed:", error);
            router.replace('/error');
        }
    };
    
    // The signinCallback function is not immediately available.
    // We need to wait for the auth context to be initialized.
    // The dependency array ensures this useEffect runs again when signinCallback is ready.
    if (signinCallback) {
        handleSigninCallback();
    }
  }, [signinCallback, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Authenticating, please wait...</p>
        </div>
    </div>
  );
}
