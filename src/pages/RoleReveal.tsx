import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RoleReveal() {
  const { roomId, playerId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [player, setPlayer] = useState<any | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [revealed, setRevealed] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  // 🔥 FIX: Stop ordering by joined_at (it leaks undercover)
  useEffect(() => {
    async function load() {
      const { data: pData } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .single();

      if (!pData) {
        setError("Player not found");
        setLoading(false);
        return;
      }

      const { data: playersData } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId);

      // Shuffle to avoid undercover always appearing first
      if (playersData) {
        for (let i = playersData.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [playersData[i], playersData[j]] = [playersData[j], playersData[i]];
        }
      }

      setPlayer(pData);
      setPlayers(playersData || []);
      setRevealed(Boolean(pData.is_revealed));
      setLoading(false);
    }

    load();
  }, [roomId, playerId]);

  function getUnrevealedPlayers() {
    return players.filter((p) => !p.is_revealed && p.id !== player?.id);
  }

  function allPlayersRevealed() {
    return players.every((p) => p.is_revealed);
  }

  const unrevealedPlayers = getUnrevealedPlayers();
  const isLastPlayer = revealed && allPlayersRevealed();

  async function handleReveal() {
    if (revealed || !player) return;

    await supabase
      .from("players")
      .update({ is_revealed: true })
      .eq("id", player.id);

    setRevealed(true);

    const { data: playersData } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId);

    // Shuffle again when updating
    if (playersData) {
      for (let i = playersData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playersData[i], playersData[j]] = [playersData[j], playersData[i]];
      }
    }

    setPlayers(playersData || []);
  }

  if (loading)
    return <div className="text-white p-6">Loading...</div>;

  if (error)
    return <div className="text-red-400 p-6">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
      <div className="w-full max-w-lg text-center">

        <h1 className="text-3xl font-bold mb-4">Role Reveal</h1>
        <p className="opacity-80 mb-6">Player: {player.name}</p>

        <div
          ref={cardRef}
          onClick={handleReveal}
          className={`relative mx-auto p-10 rounded-xl border border-white/20 bg-white/5 cursor-pointer transition-all ${
            revealed ? "" : "hover:scale-105"
          }`}
        >
          {!revealed ? (
            <>
              <div className="text-sm opacity-70 mb-2">Tap to reveal</div>
              <div className="text-5xl font-bold">?</div>
            </>
          ) : (
            <>
              <div className="text-xs uppercase opacity-60">Your word</div>
              <div className="text-4xl font-extrabold mt-2">{player.word}</div>
            </>
          )}
        </div>

        {revealed && unrevealedPlayers.length > 0 && (
          <div className="mt-6">
            <p className="text-sm opacity-70 mb-3">Pass device to next player:</p>
            <div className="space-y-2">
              {unrevealedPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/game/${roomId}/role-reveal/${p.id}`)}
                  className="w-full px-6 py-3 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-700 transition"
                >
                  Pass to {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {revealed && isLastPlayer && (
          <p className="mt-4 text-green-300 font-semibold">
            All players have revealed their roles!
          </p>
        )}

        <button
          onClick={() => {
            if (isLastPlayer) navigate(`/discussion/${roomId}/${playerId}`);
          }}
          className={`mt-10 px-8 py-4 rounded-lg font-bold text-lg w-full ${
            isLastPlayer
              ? "bg-purple-600 text-white"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
          }`}
        >
          {isLastPlayer ? "Start Discussion →" : "Waiting for all players..."}
        </button>
      </div>
    </div>
  );
}
