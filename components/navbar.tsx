"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  KeyRound,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { isLoggedIn, getUserInfo } from "@/src/utils/auth";
import { toast } from "sonner";

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loggedIn = mounted ? isLoggedIn() : false;
  const userInfo = mounted ? getUserInfo() : null;

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      toast.success("Logged out successfully");
      setShowProfileMenu(false);
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              OA
            </div>
            <span className="hidden sm:inline">OneselfAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost">{item.label}</Button>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {loggedIn ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileMenu((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate hidden lg:block">
                    {userInfo?.name || "User"}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg overflow-hidden">
                    <div className="p-3 border-b">
                      <p className="text-sm font-medium truncate">{userInfo?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{userInfo?.email || ""}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" onClick={() => setShowProfileMenu(false)}>
                        <button className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2 transition-colors">
                          <User className="w-4 h-4" /> Profile
                        </button>
                      </Link>
                      <Link href="/change-password" onClick={() => setShowProfileMenu(false)}>
                        <button className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2 transition-colors">
                          <KeyRound className="w-4 h-4" /> Change Password
                        </button>
                      </Link>
                    </div>
                    <div className="border-t py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                className="hidden sm:flex bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => router.push("/login")}
              >
                Get Started
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  {item.label}
                </Button>
              </Link>
            ))}

            {loggedIn ? (
              <>
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Profile
                  </Button>
                </Link>
                <Link href="/change-password" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Change Password
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => {
                  router.push("/login");
                  setIsOpen(false);
                }}
              >
                Get Started
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
