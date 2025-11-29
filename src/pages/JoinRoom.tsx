import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../lib/roomStore";

export default function JoinRoom() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const handleJoin = async () => {
    console.log("Attempting to join room:", roomId);

    const room = await joinRoom(roomId, "Player");

    console.log("joinRoom() returned:", room);

    if (!room) {
      alert("Room does not exist");
      return;
    }

    navigate(`/room/${roomId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Join Room</h1>
      <input
        className="border p-2 mt-4"
        placeholder="Enter Room Code"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
      />
      <button
        onClick={handleJoin}
        className="ml-3 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Join
      </button>
    </div>
  );
}
