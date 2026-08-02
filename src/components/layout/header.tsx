"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Menu, LogOut, User, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks: { href: string; label: string }[] = [];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/admin/login") return null;

  const isAdmin = pathname.startsWith("/admin");
  const isRetreatDetail = /^\/retreats\/\d+/.test(pathname);
  const overlay = isRetreatDetail && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${
        overlay
          ? "border-transparent bg-transparent"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between pl-4">
        <div className="flex items-center gap-2 -ml-2">
          <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="My Retreat Nest"
              className="h-9 w-9 rounded-xl object-contain"
            />
            <span
              className={`text-lg font-bold tracking-tight transition-colors ${
                overlay ? "text-white" : ""
              }`}
            >
              My Retreat Nest
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center">
            {isLoading ? null : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-3" />}>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      overlay ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span
                    className={`text-sm font-medium max-w-[120px] truncate transition-colors ${
                      overlay ? "text-white" : ""
                    }`}
                  >
                    {user?.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-colors ${
                      overlay ? "text-white/70" : "text-muted-foreground"
                    }`}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!isAdmin && (
                  <DropdownMenuItem onClick={() => router.push("/wishlist")}>
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push(user?.login_type === "admin" ? "/admin/account" : "/account")}>
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={
                      overlay
                        ? "text-white hover:bg-white/15 hover:text-white"
                        : undefined
                    }
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="md:hidden"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={overlay ? "text-white hover:bg-white/15 hover:text-white" : undefined}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr />
                {isLoading ? null : isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 pb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    <hr />
                    {!isAdmin && (
                    <Link
                      href="/wishlist"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium"
                    >
                      Wishlist
                    </Link>
                    )}
                    <Link
                      href={user?.login_type === "admin" ? "/admin/account" : "/account"}
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium"
                    >
                      Account
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                    >
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
