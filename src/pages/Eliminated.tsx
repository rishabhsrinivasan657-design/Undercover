import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Eliminated() {
  const { roomId, eliminatedId, playerId } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!eliminatedId) return;
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", eliminatedId)
        .single();

      if (error) {
        console.error("Failed to load eliminated player:", error);
        return;
      }

      if (mounted) setPlayer(data);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [eliminatedId]);

  async function handleContinue() {
    if (processing) return;
    setProcessing(true);

    try {
      const { data: allPlayers } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId);

      const undercover = allPlayers?.find((p: any) => p.role === "undercover");
      const alive = allPlayers?.filter((p: any) => !p.is_eliminated) || [];
      const aliveCount = alive.length;

      // Undercover eliminated → civilians win
      if (undercover?.is_eliminated) {
        await supabase.from("rooms").update({ phase: "results" }).eq("id", roomId);
        navigate(`/results/${roomId}`);
        return;
      }

      // Undercover wins if ≤ 2 players alive
      if (aliveCount <= 2) {
        await supabase.from("rooms").update({ phase: "results" }).eq("id", roomId);
        navigate(`/results/${roomId}`);
        return;
      }

      // Next discussion round
      const { data: roomData } = await supabase
        .from("rooms")
        .select("round")
        .eq("id", roomId)
        .single();

      const nextRound = (roomData?.round ?? 1) + 1;

      await supabase
        .from("rooms")
        .update({ phase: "discussion", round: nextRound })
        .eq("id", roomId);

      navigate(`/discussion/${roomId}/${playerId}`);
    } catch (e) {
      console.error("Continue error:", e);
      navigate(`/discussion/${roomId}/${playerId}`);
    } finally {
      setProcessing(false);
    }
  }

  if (!player)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center animate-pulse">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center fade-in">

      {/* Glowing red X */}
      <div className="text-7xl mb-6 drop-shadow-[0_0_25px_rgba(255,0,0,0.8)] animate-pop">
        ❌
      </div>

      {/* Card */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl px-10 py-8 shadow-2xl max-w-md w-full animate-slide-up">

        <div className="text-3xl font-bold text-red-400 mb-2 drop-shadow-lg">
          {player.name}
        </div>

        <div className="text-2xl text-red-300 font-semibold animate-pulse-slow">
          Eliminated!
        </div>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-40" />

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={processing}
          className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 active:scale-95 
                     transition-all rounded-xl text-white font-bold text-xl shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing…" : "Continue →"}
        </button>

      </div>

      {/* Subtle bottom divider for flair */}
      <div className="mt-10 h-[2px] w-40 bg-purple-500/30 rounded-full" />

      {/* Animations */}
      <style>
        {`
          .fade-in {
            animation: fadeIn 0.7s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-pop {
            animation: popIn 0.5s ease-out;
          }
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            80% { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }

          .animate-slide-up {
            animation: slideUp 0.6s ease-out;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-pulse-slow {
            animation: pulseSlow 2s infinite;
          }
          @keyframes pulseSlow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.55; }
          }
        `}
      </style>
    </div>
  );
}
