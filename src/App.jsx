import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { Footer } from "./components/Footer.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import Spotlight from "./components/Spotlight.jsx";
import Grain from "./components/Grain.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Preloader from "./components/Preloader.jsx";
import Home from "./pages/Home.jsx";
import Operations from "./pages/Operations.jsx";
import LiveData from "./pages/LiveData.jsx";
import Agents from "./pages/Agents.jsx";
import Artefacts from "./pages/Artefacts.jsx";
import Chat from "./pages/Chat.jsx";
import Log from "./pages/Log.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  const location = useLocation();
  const [booted, setBooted] = useState(false);

  return (
    <div className="min-h-screen bg-[#08080f] text-zinc-200 flex flex-col">
      <ScrollProgress />
      <Spotlight />
      <Grain />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <div key={location.pathname} className="page-enter">
          <Routes location={location}>
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
        </div>
      </main>
      <Footer />
      <ChatWidget />
      <CustomCursor />
      {!booted && (
        <Preloader
          onDone={() => {
            window.dispatchEvent(new Event("ignite:ready"));
            setBooted(true);
          }}
        />
      )}
    </div>
  );
}
