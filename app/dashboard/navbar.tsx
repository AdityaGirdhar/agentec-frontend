import { useEffect, useState } from "react";
import Image from "next/image";
import { Home, Settings, Menu, Bot, Bookmark, LayoutDashboard, CircleGauge, ListChecks, Building2, ShoppingBag, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { link } from "fs";

const links = [
  { name: "Home", icon: Home, link: "/" },
  { name: "Dashboard", icon: LayoutDashboard, link: "/dashboard" },
  { name: "Your Agents", icon: Bot, link: "/dashboard/agents" },
  { name: "Saved Agents", icon: Bookmark, link: "/dashboard/saved" },
  { name: "Usage", icon: CircleGauge, link: "/dashboard/usage" },
  { name: "Tasks", icon: ListChecks, link: "/dashboard/tasks" },
  { name: "Organisation", icon: Building2, link: "/dashboard/org" },
  { name: "Marketplace", icon: ShoppingBag, link: "/dashboard/marketplace" },
  { name: "Settings", icon: Settings, link: "/dashboard/settings" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const goToLink = (link: string) => router.push(link);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }

    fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  return (
    <aside className={`fixed left-0 h-screen bg-zinc-800 text-white flex flex-col ${expanded ? "w-56" : "w-20"} transition-all duration-100 p-4`}>
      {/* Toggle Button */}
      <button className="ml-1 mt-4 p-2 bg-zinc-800 rounded-md" onClick={() => setExpanded(!expanded)}>
      {expanded ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Logo Section */}
      <div className="flex items-center gap-3">
      <Image className="ml-2 mt-6" src={expanded ? "/logo.png" : "/logo-small.png"} alt="Logo" width={expanded ? 100 : 30} height={expanded ? 40 : 30} />
      {expanded}
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col mt-6 gap-1 flex-grow">
      {links.map(({ name, icon: Icon, link }) => (
        <button onClick={() => goToLink(link)} key={name} className="flex items-center gap-3 p-3 hover:bg-zinc-700 rounded-md">
        <Icon size={24} />
        {expanded && <span>{name}</span>}
        </button>
      ))}
      </nav>

      {/* User Section */}
      {user ? (
      <div className="mt-auto flex items-center gap-3 cursor-pointer p-3 hover:bg-zinc-700 rounded-md" onClick={() => alert("User profile clicked!")}> 
      <img src={user.avatar_url} alt="Profile" width={40} height={40} className="rounded-full" />
      {expanded && <span className="font-bold">{user.name}</span>}
      </div>
      ) : (
      <p>Loading...</p>
      )}

      {/* Logout Button */}
    <button onClick={handleLogout} className="flex items-center gap-3 p-3 hover:bg-zinc-700 rounded-md text-red-500">
      <LogOut size={24} />
      {expanded && <span>Logout</span>}
    </button>
    </aside>
  );
}
