"use client";

import Image from "next/image";

// Use the uploaded image path or a relative path if moved to public
// The user provided images. I should assume they are in the active brain or I should move them.
// "C:/Users/K_Sricharan/.gemini/antigravity/brain/.../uploaded_image_0_1768466585656.png"
// I cannot access that path from the browser (Next.js public folder).
// I MUST move it to /public/assets/logo.png first.

export default function AnimatedLogo() {
  return (
    <div className="relative group w-48 h-24 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
      {/* Glitch effect container */}
      <div className="relative animate-glitch">
        <Image
          src="/assets/logo.png"
          alt="Enigma Logo"
          width={200}
          height={100}
          className="object-contain filter invert contrast-150 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
        />
      </div>

      <style jsx>{`
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        .animate-glitch:hover {
          animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
      `}</style>
    </div>
  );
}
