import { useParams, useNavigate } from "react-router-dom";

export default function Discussion() {
  const { roomId, playerId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold mb-3">Discussion Phase</h1>

      <p className="opacity-70 mb-10 max-w-md text-lg">
        Talk with the group and decide who seems the most suspicious.
      </p>

      <button
        onClick={() => navigate(`/voting/${roomId}/${playerId}`)}
        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-white text-xl shadow-lg"
      >
        Proceed to Voting →
      </button>
    </div>
  );
}
