"use client";

import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { COGNITO_CLIENT_ID } from "@/lib/cognito";

export function LogoutButton() {
  const auth = useAuth();
  
  const handleLogout = () => {
    // This function depends on browser APIs, so we must ensure it only runs on the client.
    if (typeof window !== "undefined") {
      const authority = auth.settings.authority;
      const logout_uri = `${window.location.origin}/`;

      const logoutUrl = new URL(`${authority.replace('/.well-known/openid-configuration', '')}/logout`);
      logoutUrl.searchParams.append("client_id", COGNITO_CLIENT_ID);
      logoutUrl.searchParams.append("logout_uri", logout_uri);
      
      auth.removeUser().then(() => {
        window.location.href = logoutUrl.toString();
      });
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
