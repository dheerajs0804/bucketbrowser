"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { S3Client, ListObjectsV2Command, _Object } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool, fromCognitoIdentityPool as getCredentialsFromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { AWS_REGION, COGNITO_IDENTITY_POOL_ID, COGNITO_USER_POOL_ID } from "@/lib/cognito";
import { formatBytes } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { AlertCircle, Calendar as CalendarIcon, Download, Folder, File as FileIcon, Search } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "react-oidc-context";


export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const [s3Client, setS3Client] = useState<S3Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bucket, setBucket] = useState("");
  const [region, setRegion] = useState(AWS_REGION);
  const [prefix, setPrefix] = useState("");
  const [files, setFiles] = useState<_Object[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>()
  const [extension, setExtension] = useState("");

  useEffect(() => {
    if (auth.isLoading) return; 

    if (!auth.isAuthenticated || !auth.user?.id_token) {
      router.replace("/");
      return;
    }
    
    // We don't create a default client anymore, as the region is dynamic.
    // The client will be created on-demand in handleSearch.

  }, [auth, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.isAuthenticated || !auth.user?.id_token) {
      setError("Authentication failed. Please log in again.");
      return;
    }
    if (!bucket || !region) {
        setError("Bucket name and region are required.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setFiles([]);

    try {
      const credentials = getCredentialsFromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: AWS_REGION }),
        identityPoolId: COGNITO_IDENTITY_POOL_ID,
        logins: {
          [`cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`]: auth.user.id_token,
        },
      });

      const dynamicS3Client = new S3Client({
        region: region,
        credentials,
      });
      setS3Client(dynamicS3Client);


      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      });
      const response = await dynamicS3Client.send(command);

      let filteredContents = response.Contents || [];

      if (extension) {
        filteredContents = filteredContents.filter(file => file.Key?.endsWith(`.${extension}`));
      }

      if (date?.from && date?.to) {
        filteredContents = filteredContents.filter(file => {
          if (!file.LastModified) return false;
          const lastModified = new Date(file.LastModified);
          return lastModified >= date.from! && lastModified <= date.to!;
        });
      }

      setFiles(filteredContents);
    } catch (err: any) {
      console.error(err);
      if(err.name === 'NoSuchBucket') {
        setError(`Bucket "${bucket}" not found. Please check the name and your permissions.`);
      } else if (err.name === 'CredentialsError') {
        setError("Authentication error. Your credentials may have expired. Please log out and log in again.");
      }
      else {
        setError(`Failed to fetch files: ${err.message}. Check bucket name, region, and permissions.`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = async (key: string | undefined) => {
    if (!s3Client || !key) {
        setError("S3 client is not available or file key is missing.");
        return;
    }
    try {
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        window.open(url, '_blank');
    } catch (err: any) {
        setError(`Failed to generate download link: ${err.message}`);
    }
  };

  if (auth.isLoading) {
    return (
        <div className="flex items-center justify-center p-8">
            <Skeleton className="w-full h-96" />
        </div>
    )
  }

  return (
    <div className="container mx-auto">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">S3 Bucket Explorer</CardTitle>
                <CardDescription>Enter a bucket name and optional filters to list files.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <Label htmlFor="bucket">Bucket Name</Label>
                        <Input id="bucket" placeholder="e.g., my-awesome-bucket" value={bucket} onChange={e => setBucket(e.target.value)} required />
                    </div>
                     <div>
                        <Label htmlFor="region">Bucket Region</Label>
                        <Input id="region" placeholder="e.g., us-east-1" value={region} onChange={e => setRegion(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="prefix">Prefix (Folder)</Label>
                        <Input id="prefix" placeholder="e.g., documents/2024/" value={prefix} onChange={e => setPrefix(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="extension">File Extension</Label>
                        <Input id="extension" placeholder="e.g., jpg" value={extension} onChange={e => setExtension(e.target.value)} />
                    </div>
                    <div className="lg:col-span-4">
                        <Label htmlFor="date-range">Modified Date Range</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date range</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button type="submit" disabled={isLoading || !bucket} className="w-full bg-primary hover:bg-primary/90">
                        {isLoading ? "Searching..." : <><Search className="mr-2 h-4 w-4" /> Search</>}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {error && (
            <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="mt-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Files</CardTitle>
                    <CardDescription>Showing files from bucket: <strong>{bucket}</strong> in region: <strong>{region}</strong></CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[400px]">File Name</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Last Modified</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-4/5" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : files.length > 0 ? (
                                    files.map((file) => file.Key && (
                                        <TableRow key={file.Key}>
                                            <TableCell className="font-medium flex items-center">
                                                {file.Key.endsWith('/') ? <Folder className="h-4 w-4 mr-2 text-primary" /> : <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />}
                                                {file.Key.substring(prefix.length)}
                                            </TableCell>
                                            <TableCell>{formatBytes(file.Size || 0)}</TableCell>
                                            <TableCell>{file.LastModified?.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                {!file.Key.endsWith('/') && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleDownload(file.Key)}>
                                                        <Download className="h-4 w-4 text-accent" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No files found. Try a different search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
