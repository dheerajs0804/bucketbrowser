"use client";

import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import { AwsLogo } from "@/components/icons/aws";

export function LoginButton() {
  const auth = useAuth();

  const handleLogin = () => {
    auth.signinRedirect();
  };

  if (auth.isLoading) {
    return null; 
  }

  if (auth.isAuthenticated) {
    return null;
  }

  return (
    <Button 
      onClick={handleLogin} 
      className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
      disabled={auth.isLoading}
    >
      <AwsLogo className="h-6 w-6 mr-2" />
      {auth.isLoading ? "Loading..." : "Continue with Cognito"}
    </Button>
  );
}
