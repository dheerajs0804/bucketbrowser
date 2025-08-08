"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";
import { AwsLogo } from "./icons/aws";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <AwsLogo className="h-8 w-8 text-primary" />
        <span className="font-headline text-xl">BucketBrowser</span>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
