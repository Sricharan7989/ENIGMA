"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CreateTeamForm from "@/components/CreateTeamForm";
import JoinTeamForm from "@/components/JoinTeamForm";
import TeamDashboard from "@/components/TeamDashboard";

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

export default function TeamManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [hasTeam, setHasTeam] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchTeamData();
    }
  }, [status, router]);

  const fetchTeamData = async () => {
    try {
      const response = await fetch("/api/teams");
      const data = await response.json();

      if (data.success) {
        setHasTeam(data.hasTeam);
        setIsLeader(data.isLeader || false);
        setTeamData(data.team || null);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleTeamAction = (team: TeamData) => {
    setTeamData(team);
    setHasTeam(true);
    fetchTeamData(); // Refresh data
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-white font-mono tracking-widest animate-pulse">LOADING_DATA...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black font-mono text-white mb-2 tracking-tighter uppercase relative inline-block">
            <span className="relative z-10">Unit Management</span>
            <span className="absolute -inset-1 bg-white/10 blur-xl -z-10"></span>
          </h1>
          <p className="text-gray-500 font-mono tracking-widest text-sm uppercase">
            [ SECURE TERMINAL ACCESS GRANTED ]
          </p>
        </div>

        {hasTeam && teamData ? (
          // Show team dashboard if user has a team
          <TeamDashboard team={teamData} isLeader={isLeader} />
        ) : (
          // Show create/join forms if user doesn't have a team
          <div className="max-w-xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex mb-0">
              <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 py-4 px-4 text-center font-mono font-bold uppercase tracking-wider transition-all border border-b-0 ${activeTab === "create"
                    ? "bg-white text-black border-white"
                    : "bg-black text-gray-500 border-white/30 hover:text-white hover:bg-white/5"
                  }`}
              >
                Create_Unit
              </button>
              <button
                onClick={() => setActiveTab("join")}
                className={`flex-1 py-4 px-4 text-center font-mono font-bold uppercase tracking-wider transition-all border border-b-0 border-l-0 ${activeTab === "join"
                    ? "bg-white text-black border-white"
                    : "bg-black text-gray-500 border-white/30 hover:text-white hover:bg-white/5"
                  }`}
              >
                Join_Unit
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-black border border-white p-1">
              {activeTab === "create" ? (
                <CreateTeamForm onSuccess={handleTeamAction} />
              ) : (
                <JoinTeamForm onSuccess={handleTeamAction} />
              )}
            </div>

            {/* Info Section */}
            <div className="mt-8 border border-white/20 p-6 bg-white/5">
              <h3 className="text-lg font-mono font-bold text-white mb-4 uppercase flex items-center">
                <span className="w-2 h-2 bg-white mr-3"></span> Protocol Instructions
              </h3>
              <div className="grid md:grid-cols-2 gap-8 text-xs font-mono text-gray-400">
                <div>
                  <h4 className="font-bold text-white mb-2 uppercase tracking-wide border-b border-gray-700 pb-1">Initiating New Unit:</h4>
                  <ul className="space-y-2 list-none">
                    <li>{">"} Define Unit Designation</li>
                    <li>{">"} Receive Encrypted Access Code</li>
                    <li>{">"} Distribute Code needed for Operative recruitment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 uppercase tracking-wide border-b border-gray-700 pb-1">Joining Existing Unit:</h4>
                  <ul className="space-y-2 list-none">
                    <li>{">"} Obtain Access Code from Leader</li>
                    <li>{">"} Input 6-Character Key</li>
                    <li>{">"} Await Authentication</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
