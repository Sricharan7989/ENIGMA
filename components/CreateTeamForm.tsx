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

interface CreateTeamFormProps {
  onSuccess?: (team: TeamData) => void;
}

export default function CreateTeamForm({ onSuccess }: CreateTeamFormProps) {
  const [formData, setFormData] = useState({
    teamName: "",
    clubName: "",
    maxMembers: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/teams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) {
          onSuccess(data.team);
        }
        alert(
          `Team created successfully! Your team code is: ${data.team.teamCode}. Share this code with your teammates.`
        );
        router.refresh();
      } else {
        setError(data.error || "Failed to create team");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxMembers" ? parseInt(value) : value,
    }));
  };

  return (
    <div className="enigma-box border-t-0 rounded-none shadow-none p-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-mono font-bold text-white mb-6 uppercase tracking-wider">
        Initialize New Unit
      </h2>

      {error && (
        <div className="mb-6 p-3 border border-red-500 bg-red-900/20 text-red-500 text-sm font-mono">
          [ERROR] {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wide">
            Unit Designation (Name)
          </label>
          <input
            type="text"
            required
            aria-label="Team Name"
            name="teamName"
            className="enigma-input font-mono uppercase"
            placeholder="ENTER_TEAM_NAME"
            value={formData.teamName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wide">
            Affiliation (Club Name) <span className="text-gray-600">[OPTIONAL]</span>
          </label>
          <input
            type="text"
            aria-label="Club Name"
            name="clubName"
            className="enigma-input font-mono uppercase"
            placeholder="ENTER_CLUB_NAME"
            value={formData.clubName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wide">
            Max Operatives
          </label>
          <div className="flex items-center space-x-4 border border-white/20 p-4 bg-black">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              className="w-full accent-white h-1 bg-gray-800 rounded-none appearance-none cursor-pointer"
            />
            <span className="font-mono text-xl text-white font-bold w-12 text-center border-l border-white/20 pl-4">{formData.maxMembers}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full enigma-button bg-white text-black hover:bg-gray-200 mt-4 h-12 flex items-center justify-center font-bold"
        >
          {loading ? (
            <span className="animate-pulse">INITIALIZING...</span>
          ) : (
            "ESTABLISH UNIT"
          )}
        </button>
      </form>

      <div className="mt-6 text-[10px] font-mono text-gray-600 text-center uppercase tracking-widest border-t border-white/10 pt-4">
        A secure comms channel will be generated upon unit establishment.
      </div>
    </div>
  );
}
