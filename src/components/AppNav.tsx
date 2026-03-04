import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Fish, Settings, Image, Sparkles, Palette, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AppNav: React.FC = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const links = [
    { to: "/", label: "Generator", icon: Sparkles },
    { to: "/shop-setup", label: "Shop Setup", icon: Settings },
    { to: "/my-cards", label: "My Cards", icon: Image },
    { to: "/theme-gallery", label: "Themes", icon: Palette },
  ];

  return (
    <nav className="glass-panel-strong glow-border px-2 py-2 mb-6 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 mr-4">
        <Fish className="text-primary" size={22} />
        <span className="font-bold text-sm text-foreground glow-text">FishCard</span>
      </div>
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to}
          className={location.pathname === to ? "nav-link-active flex items-center gap-1.5 text-sm" : "nav-link flex items-center gap-1.5 text-sm"}>
          <Icon size={14} />
          {label}
        </NavLink>
      ))}
      {user && (
        <button onClick={() => signOut()} className="nav-link flex items-center gap-1.5 text-sm ml-auto">
          <LogOut size={14} /> Sign Out
        </button>
      )}
    </nav>
  );
};

export default AppNav;
