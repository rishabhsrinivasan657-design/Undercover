import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getRoom } from "../lib/roomStore";
import { startGame } from "../lib/startGame";
import { useLocalPlayers } from "../lib/localPlayers";

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { players, addPlayer, removePlayer, clear } = useLocalPlayers();

  const [room, setRoom] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (!id) return;
    loadRoom();
    loadUser();
  }, [id]);

  async function loadRoom() {
    const r = await getRoom(id!);
    setRoom(r);
  }

  async function loadUser() {
    const s = await supabase.auth.getUser();
    setUserId(s.data.user?.id ?? null);
  }

  // 🔥 FIX: Randomize the first reveal player
  async function startRevealFlow() {
    const { data: playersRes } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", id);

    if (!playersRes || playersRes.length === 0) return;

    // Shuffle to avoid always picking undercover
    for (let i = playersRes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playersRes[i], playersRes[j]] = [playersRes[j], playersRes[i]];
    }

    const first = playersRes[0];

    navigate(`/game/${id}/role-reveal/${first.id}`);
  }

  async function handleStartGame() {
    if (!room || !userId) return;

    const formatted = players.map((p) => ({
      id: p.id,
      room_id: room.id,
      name: p.name,
      joined_at: new Date().toISOString(),
      is_eliminated: false,
      vote_for: null,
      is_revealed: false,
    }));

    await supabase.from("players").insert(formatted);

    await startGame(room.id, userId);

    clear();
    startRevealFlow();
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center p-6">
      <div className="w-full max-w-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">

        {/* Room ID */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Room ID</h1>

          <button
            className="text-sm bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20"
            onClick={() => navigator.clipboard.writeText(id || "")}
          >
            📋 Copy
          </button>
        </div>

        <p className="text-xl font-semibold mb-4 text-purple-300">{id}</p>

        {/* Add players */}
        <h2 className="text-lg font-semibold mt-6 mb-2">Add Players (Offline)</h2>

        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 bg-slate-800 border border-white/20 text-white p-3 rounded-xl placeholder-white/40 focus:outline-none"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter player name"
          />
          <button
            className="bg-green-600 px-4 py-2 rounded-xl hover:bg-green-700 active:scale-95 transition"
            onClick={() => {
              if (!nameInput.trim()) return;
              addPlayer(nameInput.trim());
              setNameInput("");
            }}
          >
            ➕
          </button>
        </div>

        {/* Player list */}
        <ul className="mt-6 space-y-3">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between bg-white/10 border border-white/20 rounded-xl px-4 py-3"
            >
              <span className="font-medium">{p.name}</span>
              <button
                className="text-red-400 hover:text-red-500"
                onClick={() => removePlayer(p.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {/* Start Game */}
        {room && userId === room.host_id && players.length > 2 && (
          <button
            onClick={handleStartGame}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-lg active:scale-95 transition"
          >
            🚀 Start Game
          </button>
        )}
      </div>
    </div>
  );
}
