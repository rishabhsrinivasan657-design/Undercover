import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";

import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Room from "./pages/Room";

import Game from "./pages/Game";
import RoleReveal from "./pages/RoleReveal";
import Discussion from "./pages/Discussion";
import Voting from "./pages/Voting";
import Eliminated from "./pages/Eliminated";
import Results from "./pages/Results";

function App() {
  useEffect(() => {
    async function ensureAuth() {
      const session = await supabase.auth.getSession();

      if (!session.data.session) {
        await supabase.auth.signInAnonymously();
      }
    }

    ensureAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/room/:id" element={<Room />} />

        <Route path="/game/:roomId" element={<Game />} />
        <Route path="/game/:roomId/role-reveal/:playerId" element={<RoleReveal />} />

        <Route path="/discussion/:roomId/:playerId" element={<Discussion />} />
        <Route path="/voting/:roomId/:playerId" element={<Voting />} />

        <Route path="/eliminated/:roomId/:eliminatedId/:playerId" element={<Eliminated />} />

        <Route path="/results/:roomId" element={<Results />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
