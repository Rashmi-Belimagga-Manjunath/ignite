import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { Footer } from "./components/Footer.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import Home from "./pages/Home.jsx";
import Operations from "./pages/Operations.jsx";
import LiveData from "./pages/LiveData.jsx";
import Agents from "./pages/Agents.jsx";
import Artefacts from "./pages/Artefacts.jsx";
import Chat from "./pages/Chat.jsx";
import Log from "./pages/Log.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-[#08080f] text-zinc-200 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/data" element={<LiveData />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/artefacts" element={<Artefacts />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/log" element={<Log />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
      <CustomCursor />
    </div>
  );
}
