import { useState } from "react";
import {
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Award,
  ClipboardCheck,
  Target,
  MessageSquare,
  Video,
  Bell,
  LogOut,
  Menu,
  X,
  Cloud,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navItems = [
  { to: "/student", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/student/courses", label: "My Courses", icon: BookOpen },
  { to: "/student/grades", label: "Grade Report", icon: Award },
  { to: "/student/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/student/competency", label: "Competency Tracker", icon: Target },
  { to: "/student/communication", label: "Communication", icon: MessageSquare },
  { to: "/student/meetings", label: "Video Meetings", icon: Video },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(3);
  const [lastSynced, setLastSynced] = useState("0 min ago");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Route protection
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "student") return <Navigate to="/unauthorized" replace />;

  const currentTitle =
    navItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label ?? "Dashboard";

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPending(0);
    setLastSynced("just now");
    setSyncing(false);
    toast.success("Everything is synced");
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    toast.info("Signed out");
    navigate("/");
  };

  const Sidebar = (
    <aside className="flex h-full w-72 flex-col border-r bg-white">
      <div className="border-b px-6 py-5">
        <h1 className="text-xl font-medium leading-snug text-blue-600">
          Learning Management System
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition-colors ${
                isActive
                  ? "bg-blue-50 font-medium text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold uppercase text-blue-600">
            {user.name?.[0] ?? "S"}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{user.name}</p>
            <p className="text-sm capitalize text-gray-500">{user.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="mt-3 w-full cursor-pointer justify-center text-gray-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">{Sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="h-full shadow-xl">{Sidebar}</div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b bg-white px-4 md:px-9">
          <div className="flex items-center gap-3">
            <button
              className="cursor-pointer md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h2 className="text-2xl font-medium text-gray-900">{currentTitle}</h2>
          </div>

          <div className="flex items-center gap-5">
            <button
              className="relative cursor-pointer text-gray-600"
              onClick={() => navigate("/student/communication")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="hidden items-center gap-2 text-sm text-gray-600 sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              System Operational
            </div>
          </div>
        </header>

        {/* Page area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-9">
          {/* Sync bar */}
          <div className="mb-8 flex items-center justify-between rounded-xl border bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <Cloud className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Last synced {lastSynced}</p>
                <p className="text-xs text-gray-500">{pending} items pending sync</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing || pending === 0}
              className="cursor-pointer"
            >
              {syncing && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Sync Now
            </Button>
          </div>

          {/* Child route render hobe ekhane */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}