"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (password.length < 6 || password.length > 20) {
            setError("Password must be between 6 and 20 characters");
            setIsLoading(false);
            return;
        }

        const domain = email.split("@")[1]?.toLowerCase();
        if (domain !== "iiits.in") {
            setError("Only @iiits.in email addresses are allowed");
            setIsLoading(false);
            return;
        }

        try {
            // Auth auto-creates the user if they don't exist
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Registration failed. Check your email domain or try a different password.");
                setIsLoading(false);
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("An error occurred during registration");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-in fade-in duration-700">
                <div>
                    <h2 className="mt-2 text-center text-4xl font-mono font-bold text-black uppercase tracking-tighter">
                        ENIGMA RECRUIT
                    </h2>
                    <p className="mt-2 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">
                        Register with your @iiits.in institute email
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
                                placeholder="INSTITUTE EMAIL ID (@iiits.in)"
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
                                autoComplete="new-password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono text-sm"
                                placeholder="PASSWORD (6-20 CHARACTERS)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono text-sm"
                                placeholder="CONFIRM PASSWORD"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {isLoading ? "REGISTERING..." : "REGISTER OPERATIVE"}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                            Already registered?{" "}
                            <Link
                                href="/auth/login"
                                className="text-black font-bold hover:underline"
                            >
                                LOGIN
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}