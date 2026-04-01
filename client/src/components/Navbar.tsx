import {
  Files,
  LogOut,
  Mail,
  Moon,
  NotebookPen,
  Sun,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  isAuthenticated: boolean;
  isLightMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const Navbar = ({
  isAuthenticated,
  isLightMode,
  onToggleTheme,
  onLogout,
}: NavbarProps) => {
  const location = useLocation();

  return (
    <header className=" top-0 left-0 right-0 z-50 p-4">
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-8 py-5 rounded-3xl border border-white/[0.12] relative overflow-hidden shadow-2xl backdrop-blur-2xl"
           style={{ 
             background: "linear-gradient(135deg, rgba(15,15,15,0.9) 0%, rgba(25,25,25,0.8) 50%, rgba(20,20,20,0.9) 100%)",
             boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 60px rgba(251,146,60,0.1)"
           }}>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-500/10 via-purple-500/5 to-blue-500/10 animate-pulse" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Brand */}
        <Link className="relative z-10 flex items-center gap-4 text-white group transition-all duration-500 hover:scale-110" 
              to="/">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" 
                 style={{ 
                   background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%)",
                   boxShadow: "0 8px 32px rgba(255,107,53,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset"
                 }}>
              <NotebookPen size={22} className="text-white drop-shadow-lg" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
          </div>
          <div className="relative">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent drop-shadow-sm">
              Vi<span className="bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">Notes</span>
            </span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 group-hover:w-full transition-all duration-500" />
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="relative z-10 flex items-center gap-2">
          <Link
            to="/files"
            className={`group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-500 hover:scale-105 overflow-hidden ${
              location.pathname === "/files" 
                ? "text-white shadow-2xl" 
                : "text-white/80 hover:text-white"
            }`}
            style={location.pathname === "/files" ? 
              { 
                background: "linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)", 
                boxShadow: "0 8px 32px rgba(194,65,12,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset" 
              } : 
              { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
            {location.pathname !== "/files" && (
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
            <Files size={18} className="relative z-10" />
            <span className="relative z-10">Files</span>
            {location.pathname === "/files" && (
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 animate-pulse" />
            )}
          </Link>

          <button
            onClick={onToggleTheme}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm text-white/80 hover:text-white transition-all duration-500 hover:scale-105 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}
            aria-label="Toggle theme">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 transition-transform duration-500 group-hover:rotate-180">
              {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <span className="relative z-10">{isLightMode ? "Dark" : "Light"}</span>
          </button>

          <a
            href="mailto:contact@vinotes.app"
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm text-white/80 hover:text-white transition-all duration-500 hover:scale-105 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Mail size={18} className="relative z-10 group-hover:animate-bounce" />
            <span className="relative z-10">Contact</span>
          </a>

          <button
            onClick={onLogout}
            disabled={!isAuthenticated}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm text-white/80 hover:text-red-400 transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <LogOut size={18} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            <span className="relative z-10">Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
