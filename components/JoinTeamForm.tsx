"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TeamData {
  id: string;
  name: string;
  teamCode: string;
  clubName: string | null;
  points: number;
  maxMembers: number;
  isActive: boolean;
  memberCount: number;
  members: {
    id: string;
    name: string | null;
    email: string;
    isTeamLeader: boolean;
    batch: string | null;
    phone_number: string | null;
  }[];
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

interface JoinTeamFormProps {
  onSuccess?: (team: TeamData) => void;
}

export default function JoinTeamForm({ onSuccess }: JoinTeamFormProps) {
  const [teamCode, setTeamCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/teams/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamCode: teamCode.toUpperCase() }),
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) {
          onSuccess(data.team);
        }
        alert(`Successfully joined team "${data.team.name}"!`);
        router.refresh();
      } else {
        setError(data.error || "Failed to join team");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length <= 6) {
      setTeamCode(value);
    }
  };

  return (
    <div className="enigma-box border-t-0 rounded-none shadow-none p-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-mono font-bold text-white mb-6 uppercase tracking-wider">
        Join Existing Unit
      </h2>

      {error && (
        <div className="mb-6 p-3 border border-red-500 bg-red-900/20 text-red-500 text-sm font-mono">
          [ERROR] {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wide">
            Access Code
          </label>
          <input
            type="text"
            required
            aria-label="Team Code"
            className="enigma-input font-mono text-center tracking-[0.5em] text-3xl uppercase placeholder:tracking-normal placeholder:text-base placeholder:normal-case h-16"
            placeholder="ENTER_CODE"
            value={teamCode}
            onChange={handleCodeChange}
            maxLength={6}
          />
          <p className="mt-2 text-[10px] font-mono text-gray-500 uppercase">
            Input the 6-character encryption key provided by the Unit Leader.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || teamCode.length !== 6}
          className="w-full enigma-button bg-white text-black hover:bg-gray-200 mt-4 h-12 flex items-center justify-center font-bold"
        >
          {loading ? (
            <span className="animate-pulse">AUTHENTICATING...</span>
          ) : (
            "ACCESS UNIT"
          )}
        </button>
      </form>

      <div className="mt-6 text-[10px] font-mono text-gray-600 text-center uppercase tracking-widest border-t border-white/10 pt-4">
        Unauthorized access attempts will be logged.
      </div>
    </div>
  );
}
