// PLACE AT: components/Navigation.tsx (REPLACE existing)
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserData } from "@/lib/actions";
import NotificationBell from "@/components/NotificationBell";

interface UserData {
  id: string;
  name?: string | null;
  email: string;
  teamId?: string | null;
  isTeamLeader?: boolean;
}

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      getUserData()
        .then(setUserData)
        .catch(() => { });
    } else {
      setUserData(null);
    }
  }, [session]);

  if (status === "loading") return null;

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="bg-black border-b border-white/20 sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image src="/images/enigma-logo.png" alt="ENIGMA" width={80} height={80} className="object-contain" />
          </Link>

          <div className="flex items-center gap-5">
            {session ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className={`font-mono text-xs uppercase tracking-wider transition-colors ${pathname === "/admin" || pathname === "/dashboard"
                      ? "text-white underline decoration-2 underline-offset-4"
                      : "text-gray-400 hover:text-white"
                    }`}
                >
                  {isAdmin ? "Command" : "Terminal"}
                </Link>

                {!isAdmin && (
                  <Link
                    href="/teams"
                    className={`font-mono text-xs uppercase tracking-wider transition-colors ${pathname === "/teams"
                        ? "text-white underline decoration-2 underline-offset-4"
                        : "text-gray-400 hover:text-white"
                      }`}
                  >
                    {userData?.teamId ? "My Team" : "Teams"}
                  </Link>
                )}

                {/* Notification Bell */}
                <NotificationBell userId={session.user.id} isAdmin={isAdmin} />

                {/* Profile Icon */}
                <Link
                  href="/profile"
                  className={`w-8 h-8 flex items-center justify-center font-mono font-bold text-sm border transition-colors ${pathname === "/profile"
                      ? "bg-white text-black border-white"
                      : "border-white/30 text-white hover:bg-white hover:text-black"
                    }`}
                  title="Profile"
                >
                  {(session.user.name || session.user.email || "?")[0].toUpperCase()}
                </Link>

                {/* Role badge */}
                {isAdmin && (
                  <span className="px-1.5 py-0.5 border border-red-500/50 text-red-400 text-[9px] font-mono uppercase tracking-widest">
                    CMD
                  </span>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-1.5 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase tracking-widest hover:bg-red-900/20 transition-colors"
                >
                  Exit
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="px-4 py-2 text-gray-400 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">
                  Login
                </Link>
                <Link href="/auth/signup" className="px-5 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-105">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
