import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import PageLayout from "./components/layout/PageLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Sports from "./pages/Sports";
import SportDetail from "./pages/SportDetail";
import Schedule from "./pages/Schedule";
import Registration from "./pages/Registration";
import Scoreboard from "./pages/Scoreboard";
import Results from "./pages/Results";
import TreasureHunt from "./pages/TreasureHunt";
import Shop from "./pages/Shop";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import More from "./pages/More";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import TournamentAdmin from "./pages/TournamentAdmin";
import AuthCallback from "./pages/AuthCallback";

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/sports/:sportId" element={<SportDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/treasure-hunt" element={<TreasureHunt />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/more" element={<More />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tournament" element={<TournamentAdmin />} />
        <Route path="/admin/tournament/:sportId" element={<TournamentAdmin />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-center" theme="dark" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
