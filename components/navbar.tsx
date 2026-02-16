"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { checkAuthStatus, logout, isLoggedIn } from "@/src/utils/auth"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loggedIn, setLoggedInState] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoggedInState(isLoggedIn())
    checkAuthStatus().then((status) => {
      setLoggedInState(status)
    })
  }, [pathname])

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    setLoggedInState(false)
    setProfileOpen(false)
    router.replace("/login")
  }

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Interview", href: "/interview-ui" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              OA
            </div>
            <span className="hidden sm:inline text-foreground">OneselfAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {loggedIn ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-popover shadow-lg">
                    <Link href="/dashboard" onClick={() => setProfileOpen(false)}>
                      <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-popover-foreground hover:bg-secondary transition-colors rounded-t-lg">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </button>
                    </Link>
                    <Link href="/profile" onClick={() => setProfileOpen(false)}>
                      <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-popover-foreground hover:bg-secondary transition-colors">
                        <User className="h-4 w-4" /> Profile
                      </button>
                    </Link>
                    <div className="border-t border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive-foreground hover:bg-destructive/10 transition-colors rounded-b-lg"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push("/login")} className="text-sm">
                  Sign In
                </Button>
                <Button onClick={() => router.push("/register")} className="text-sm">
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm ${
                    isActive(item.href)
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}

            <div className="border-t border-border pt-3 mt-3">
              {loggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm text-destructive-foreground"
                    onClick={() => {
                      handleLogout()
                      setMobileOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      router.push("/login")
                      setMobileOpen(false)
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full text-sm"
                    onClick={() => {
                      router.push("/register")
                      setMobileOpen(false)
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
