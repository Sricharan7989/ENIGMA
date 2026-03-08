// PLACE AT: app/profile/page.tsx (NEW FILE - create app/profile/ folder)
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { updateProfile, changePassword } from "@/app/actions/users";
import Link from "next/link";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [name, setName] = useState(session?.user?.name || "");
    const [nameMsg, setNameMsg] = useState("");
    const [nameLoading, setNameLoading] = useState(false);

    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwMsg, setPwMsg] = useState("");
    const [pwLoading, setPwLoading] = useState(false);

    async function handleNameSubmit(e: React.FormEvent) {
        e.preventDefault();
        setNameLoading(true);
        setNameMsg("");
        const res = await updateProfile(name);
        setNameLoading(false);
        if (res.error) {
            setNameMsg(`[ERROR] ${res.error}`);
        } else {
            setNameMsg("Name updated successfully.");
            await update({ name }); // update session
            router.refresh();
        }
    }

    async function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (newPw !== confirmPw) {
            setPwMsg("[ERROR] Passwords do not match");
            return;
        }
        setPwLoading(true);
        setPwMsg("");
        const res = await changePassword(currentPw, newPw);
        setPwLoading(false);
        if (res.error) {
            setPwMsg(`[ERROR] ${res.error}`);
        } else {
            setPwMsg("Password changed successfully.");
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        }
    }

    if (!session) return null;

    const isAdmin = session.user.role === "ADMIN";
    const initial = (session.user.name || session.user.email || "?")[0].toUpperCase();

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Back */}
                <Link
                    href={isAdmin ? "/admin" : "/dashboard"}
                    className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white uppercase tracking-widest mb-6 transition-colors"
                >
                    ← Back
                </Link>

                {/* Header */}
                <div className="mb-8 border-b border-white/20 pb-6 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white text-black flex items-center justify-center font-mono font-bold text-2xl">
                        {initial}
                    </div>
                    <div>
                        <h1 className="text-2xl font-mono font-bold text-white uppercase tracking-widest">
                            [ OPERATIVE PROFILE ]
                        </h1>
                        <p className="text-xs font-mono text-gray-500 mt-1">{session.user.email}</p>
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest mt-1 inline-block ${isAdmin ? "text-red-400" : "text-blue-400"}`}>
                            {isAdmin ? "ADMIN" : "MEMBER"}
                        </span>
                    </div>
                </div>

                {/* Update Name */}
                <div className="border border-white/20 p-6 mb-6">
                    <h2 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-4">
                        Update Display Name
                    </h2>
                    <form onSubmit={handleNameSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name..."
                            required
                            className="w-full bg-black border border-white/30 p-3 font-mono text-sm text-white focus:border-white outline-none placeholder-gray-600"
                        />
                        {nameMsg && (
                            <p className={`text-xs font-mono p-2 border ${nameMsg.includes("ERROR") ? "text-red-400 border-red-900 bg-red-900/10" : "text-green-400 border-green-900 bg-green-900/10"}`}>
                                {nameMsg}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={nameLoading}
                            className="px-6 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                            {nameLoading ? "Updating..." : "Update Name"}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="border border-white/20 p-6">
                    <h2 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-4">
                        Change Password
                    </h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={currentPw}
                            onChange={e => setCurrentPw(e.target.value)}
                            placeholder="Current password"
                            required
                            className="w-full bg-black border border-white/30 p-3 font-mono text-sm text-white focus:border-white outline-none placeholder-gray-600"
                        />
                        <input
                            type="password"
                            value={newPw}
                            onChange={e => setNewPw(e.target.value)}
                            placeholder="New password (6-20 characters)"
                            required
                            className="w-full bg-black border border-white/30 p-3 font-mono text-sm text-white focus:border-white outline-none placeholder-gray-600"
                        />
                        <input
                            type="password"
                            value={confirmPw}
                            onChange={e => setConfirmPw(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            className="w-full bg-black border border-white/30 p-3 font-mono text-sm text-white focus:border-white outline-none placeholder-gray-600"
                        />
                        {pwMsg && (
                            <p className={`text-xs font-mono p-2 border ${pwMsg.includes("ERROR") ? "text-red-400 border-red-900 bg-red-900/10" : "text-green-400 border-green-900 bg-green-900/10"}`}>
                                {pwMsg}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={pwLoading}
                            className="px-6 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                            {pwLoading ? "Changing..." : "Change Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}