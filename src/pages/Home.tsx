import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border border-white/10 bg-white/10 backdrop-blur-md rounded-2xl hover:shadow-2xl transition-all">
          <CardHeader>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <CardTitle
                className="text-4xl font-extrabold text-center tracking-wide 
                           text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]"
              >
                Undercover
              </CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 mt-4">
            <Link to="/create">
              <Button className="w-full text-lg py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all">
                🚀 Create Room
              </Button>
            </Link>

            <Link to="/join">
              <Button
                variant="outline"
                className="w-full text-lg py-6 rounded-xl border-purple-400 text-purple-300 hover:bg-purple-500/10 transition-all"
              >
                🔑 Join Room
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
