"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { isLoggedIn as checkLoggedIn } from "@/src/utils/auth";

export function Navbar() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const loggedIn = checkLoggedIn();

  const handleInterviewClick = () => {
    if (!loggedIn) {
      alert("⚠ Please login first to start the interview");
      router.push("/login");
    } else {
      router.push("/interview-ui");
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Interview", href: "/interview-ui" },
    { label: "Demo", href: "/demo" },
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
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white">
              OA
            </div>
            <span className="hidden sm:inline">OneselfAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) =>
              item.label === "Interview" ? (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={handleInterviewClick}
                >
                  Interview
                </Button>
              ) : (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost">{item.label}</Button>
                </Link>
              )
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {loggedIn ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShowProfileMenu((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/10"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg">
                    <Link href="/profile">
                      <button className="w-full px-4 py-2 text-left hover:bg-accent/10 flex gap-2">
                        <User className="w-4 h-4" /> Profile
                      </button>
                    </Link>
                    <Link href="/settings">
                      <button className="w-full px-4 py-2 text-left hover:bg-accent/10 flex gap-2">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        router.replace("/login");
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-red-500/10 text-red-600 flex gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                className="hidden sm:flex bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                onClick={() => router.push("/login")}
              >
                Get Started
              </Button>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) =>
              item.label === "Interview" ? (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleInterviewClick();
                    setIsOpen(false);
                  }}
                >
                  Interview
                </Button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    {item.label}
                  </Button>
                </Link>
              )
            )}

            {!loggedIn && (
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
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