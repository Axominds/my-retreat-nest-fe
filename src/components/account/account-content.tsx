"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ProfileForm } from "@/components/account/profile-form";
import { getUser } from "@/lib/api/users";
import type { User } from "@/types/user";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Shield,
  User as UserIcon,
  CalendarCheck,
  ArrowLeft,
  Settings,
} from "lucide-react";
import Link from "next/link";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const GRADIENT_BANNERS = [
  "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
  "from-primary/20 via-primary/5 to-emerald-500/20",
  "from-teal-500/20 via-emerald-500/10 to-green-500/20",
];

function getGradient(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    GRADIENT_BANNERS.length;
  return GRADIENT_BANNERS[idx];
}

export function AccountContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getUser(user.user_id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  if (isLoading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayedUser = {
    ...user,
    ...(profile ?? {}),
    login_type: user.login_type,
  };

  const joinDate = "created_at" in displayedUser
    ? new Date((displayedUser as { created_at: string }).created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Banner */}
      <div className={`relative bg-gradient-to-br ${getGradient(displayedUser.name)} border-b`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm text-foreground text-sm font-medium hover:bg-background/80 transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-2xl md:text-3xl font-bold shrink-0 ring-4 ring-background shadow-lg">
                {initials(displayedUser.name)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Shield className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {displayedUser.name}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {displayedUser.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Shield className="h-3 w-3" />
                  {displayedUser.login_type}
                </Badge>
                {displayedUser.phone && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Phone className="h-3 w-3" />
                    {displayedUser.phone}
                  </Badge>
                )}
                {joinDate && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <CalendarCheck className="h-3 w-3" />
                    Joined {joinDate}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-5 px-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold truncate">{displayedUser.name}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-5 px-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold truncate">{displayedUser.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-5 px-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Login Method
                  </p>
                  <p className="text-sm font-semibold capitalize">
                    {displayedUser.login_type}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold">Edit Profile</h2>
            </div>
            <ProfileForm user={displayedUser} onSaved={setProfile} />
          </div>
        </div>
      </div>
    </div>
  );
}
