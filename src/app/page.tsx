import { LoginButton } from "@/components/LoginButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AwsLogo } from "@/components/icons/aws";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex items-center gap-4">
            <AwsLogo className="h-16 w-16 text-primary"/>
            <h1 className="text-5xl font-bold tracking-tight font-headline">BucketBrowser</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Securely browse your Amazon S3 buckets. Log in with your AWS account to get started.
        </p>
      </div>
      <Card className="w-full max-w-md mt-10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome</CardTitle>
          <CardDescription>
            Authenticate with AWS Cognito to access your S3 resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginButton />
        </CardContent>
      </Card>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <p>Built for security and efficiency.</p>
      </footer>
    </main>
  );
}
