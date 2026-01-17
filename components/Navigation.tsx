"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserData } from "@/lib/actions";

interface UserData {
  id: string;
  name?: string;
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
        .catch((err) => console.error("Failed to fetch user data:", err));
    } else {
      setUserData(null);
    }
  }, [session]);

  if (status === "loading") return null;

  return (
    <nav className="bg-black border-b border-white box-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/images/enigma-logo.png"
              alt="ENIGMA"
              width={80}
              height={80}
              className="object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            {session ? (
              <>
                <Link
                  href="/teams"
                  className={`px-3 py-2 font-mono uppercase tracking-wider transition-colors ${pathname === "/teams"
                    ? "text-white underline decoration-2 underline-offset-4"
                    : "text-gray-400 hover:text-white"
                    }`}
                >
                  Teams
                </Link>

                <div className="flex items-center space-x-6">
                  <span className="text-gray-400 font-mono text-xs hidden md:inline-block uppercase tracking-wide">
                    OP: {session.user.name || session.user.email?.split("@")[0]}
                  </span>
                  {userData?.teamId && (
                    <span className="px-2 py-0.5 border border-white text-white text-[10px] font-mono uppercase tracking-widest">
                      {userData.isTeamLeader ? "LDR" : "MBR"}
                    </span>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 border border-red-500 text-red-500 font-mono text-xs uppercase tracking-widest hover:bg-red-900/20 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-gray-400 hover:text-white font-mono uppercase tracking-widest text-sm transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-6 py-2 bg-white text-black font-mono font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-all hover:scale-105"
                >
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
