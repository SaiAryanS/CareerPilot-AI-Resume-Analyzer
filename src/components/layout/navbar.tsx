
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AuthState = 'user' | 'admin' | null;

export default function Navbar() {
  // In a real app, this state would come from a global context or session management.
  const [authState, setAuthState] = useState<AuthState>(null);
  const pathname = usePathname();
  const router = useRouter();

  // This effect simulates checking session state based on the current URL.
  // It's a placeholder until a proper session management system is in place.
  useEffect(() => {
    if (pathname.startsWith('/admin/dashboard')) {
      setAuthState('admin');
    } else if (pathname === '/' || pathname.startsWith('/history')) {
      // For simplicity, we assume if you're at the root or history, you are a logged-in user.
      // This logic will be replaced by real session management.
      const userIsLoggedIn = true;
      if (userIsLoggedIn && authState !== 'admin') {
        setAuthState('user');
      }
    } else {
      setAuthState(null);
    }
  }, [pathname, authState]);

  const handleLogout = (isAdmin: boolean) => {
    setAuthState(null);
    if (isAdmin) {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  };

  const renderMenuItems = () => {
    if (authState === 'admin') {
      return (
        <>
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard">Admin Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleLogout(true)}>
            Log Out
          </DropdownMenuItem>
        </>
      );
    }
    if (authState === 'user') {
      return (
        <>
          <DropdownMenuItem asChild>
            <Link href="/">Analyze Resume</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/history">Analysis History</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleLogout(false)}>
            Log Out
          </DropdownMenuItem>
        </>
      );
    }
    // Logged out state
    return (
      <>
        <DropdownMenuItem asChild>
          <Link href="/login">Login / Register</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/login">Admin Login</Link>
        </DropdownMenuItem>
      </>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 text-primary"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="text-xl font-bold font-headline">CareerPilot AI</span>
        </Link>

        <nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {renderMenuItems()}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
