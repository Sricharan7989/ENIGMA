"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid credentials or email domain not allowed");
                setIsLoading(false);
                return;
            }

            const session = await getSession();
            if (session) {
                router.push("/");
                router.refresh();
            }
        } catch {
            setError("An error occurred during sign in");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-in fade-in duration-700">
                <div>
                    <h2 className="mt-2 text-center text-4xl font-mono font-bold text-black uppercase tracking-tighter">
                        ENIGMA ACCESS
                    </h2>
                    <p className="mt-2 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">
                        Enter credentials to proceed
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono text-sm"
                                placeholder="INSTITUTE EMAIL ID"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono text-sm"
                                placeholder="PASSWORD"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-mono">
                                        [ERROR]: {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-mono font-bold uppercase tracking-widest text-white bg-black hover:bg-gray-800 hover:scale-[1.02] transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isLoading ? "AUTHENTICATING..." : "INITIATE SESSION"}
                        </button>
                    </div>

                    <div className="text-center font-mono text-xs">
                        <Link
                            href="/auth/signup"
                            className="text-gray-600 hover:text-black hover:underline transition-all"
                        >
                            [ NO CREDENTIALS? CREATE ACCOUNT ]
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
