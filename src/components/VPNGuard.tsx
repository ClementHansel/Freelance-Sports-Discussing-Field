"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useVPNDetection } from "@/hooks/useVPNDetection";
import { Loader } from "lucide-react";

interface VPNGuardProps {
  children: React.ReactNode;
}

export const VPNGuard = ({ children }: VPNGuardProps) => {
  const { isBlocked, isLoading } = useVPNDetection();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isBlocked && pathname !== "/vpn-blocked") {
      router.replace("/vpn-blocked");
    }
  }, [isBlocked, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Checking connection...
          </p>
        </div>
      </div>
    );
  }

  if (isBlocked && pathname !== "/vpn-blocked") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
