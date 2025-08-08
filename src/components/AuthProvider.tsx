"use client";

import { AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { 
    AWS_REGION, 
    COGNITO_USER_POOL_ID, 
    COGNITO_CLIENT_ID
} from "@/lib/cognito";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // The OIDC provider and its configuration rely on browser APIs.
    // We should not render it on the server.
    if (!isMounted) {
        return null;
    }

    const oidcConfig = {
        authority: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
        client_id: COGNITO_CLIENT_ID,
        redirect_uri: `${window.location.origin}/auth/callback`,
        scope: "openid profile email", 
        post_logout_redirect_uri: `${window.location.origin}/`,
        automaticSilentRenew: false,
    };

    return (
        <OidcAuthProvider 
            {...oidcConfig}
            onSigninCallback={() => {
                router.replace('/dashboard');
            }}
            onSigninCallbackError={(error) => {
                console.error("Authentication Error:", error);
                router.replace('/error');
            }}
        >
            {children}
        </OidcAuthProvider>
    );
}
