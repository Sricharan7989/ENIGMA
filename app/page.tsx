"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Navigation from "@/components/Navigation";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">
      <Navigation />

      <main className="flex-grow relative flex flex-col items-center justify-end pb-20">
        {/* Background Image - Full Screen Cover */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/task-assignment.jpg"
            alt="Task Assignment Background"
            fill
            className="object-contain opacity-100"
            priority
          />
          {/* Gradient Overlay: Clear at top/center to highlight image, dark at bottom for button readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>

        {/* Content Wrapper - Overlaid on background */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-8">

          {/* Main Action Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {session ? (
              <>
                <Link
                  href="/teams"
                  className="bg-white text-black px-8 py-3 font-mono font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors border-2 border-transparent hover:border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                >
                  <span className="mr-2">&gt;</span> Initialize_Team
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-transparent text-white px-8 py-3 font-mono font-bold uppercase tracking-wider border-2 border-white hover:bg-white hover:text-black transition-colors"
                >
                  Access_Tasks
                </Link>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-white text-black px-12 py-4 font-mono font-bold uppercase tracking-widest hover:bg-gray-200 transition-transform hover:scale-110 shadow-[0_0_30px_rgba(255,255,255,0.5)] border-2 border-white"
              >
                [ ENTER_SYSTEM ]
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="relative z-10 border-t border-white/20 p-4 font-mono text-xs text-gray-500 flex justify-between bg-black/50 backdrop-blur-sm">
        <span>SYS.STATUS: ONLINE</span>
        <span>ENIGMA.OS v2.0</span>
      </footer>
    </div>
  );
}
