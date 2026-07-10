"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProfileForm } from "@/components/account/profile-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mail, Phone, Shield } from "lucide-react";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AccountPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile and account information
          </p>
        </div>

        {/* User info card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0">
                {initials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    {user.login_type}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile form */}
        <ProfileForm />
      </div>
    </div>
  );
}