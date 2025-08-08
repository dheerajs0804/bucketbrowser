import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ErrorPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
            <Card className="w-full max-w-md shadow-xl border-destructive">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-destructive text-destructive-foreground rounded-full p-3 w-fit">
                        <AlertCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-headline mt-4">Authentication Error</CardTitle>
                    <CardDescription>
                        Sorry, we couldn't sign you in. There was a problem during the authentication process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <p className="text-sm text-muted-foreground mb-6">Please try again. If the problem persists, contact support.</p>
                    <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/">Return to Homepage</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
}
