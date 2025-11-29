import { useNavigate } from "react-router-dom";
import { createRoom } from "../lib/roomStore";

export default function CreateRoom() {
  const navigate = useNavigate();

  const handleCreate = async () => {
    const id = await createRoom();
    navigate(`/room/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg animate-fadeIn">
        <h1 className="text-3xl font-extrabold text-center mb-6">
          Create a New Room
        </h1>

        <p className="text-center opacity-80 mb-8">
          Start a brand new Undercover game.
        </p>

        <button
          onClick={handleCreate}
          className="w-full px-6 py-4 bg-indigo-600 rounded-xl text-white font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all"
        >
          🚀 Create Room
        </button>
      </div>
    </div>
  );
}
