import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Compass,
  Flame,
  Play,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ---------- Data ---------- */
const stats = [
  { label: "Enrolled Courses", value: 5, suffix: "", hint: "2 new this month", icon: BookOpen, bg: "bg-blue-100", color: "text-blue-600", glow: "hover:shadow-blue-500/20 hover:border-blue-300" },
  { label: "Completed", value: 3, suffix: "", hint: "Great progress!", icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600", glow: "hover:shadow-green-500/20 hover:border-green-300" },
  { label: "In Progress", value: 2, suffix: "", hint: "Keep going", icon: Clock, bg: "bg-orange-100", color: "text-orange-500", glow: "hover:shadow-orange-500/20 hover:border-orange-300" },
  { label: "Average Score", value: 92, suffix: "%", hint: "Top 10% of class", icon: Award, bg: "bg-purple-100", color: "text-purple-600", glow: "hover:shadow-purple-500/20 hover:border-purple-300" },
];

const activities = [
  { dot: "bg-green-500", ping: "bg-green-400", text: 'Completed "Introduction to React"', time: "2 hours ago" },
  { dot: "bg-blue-500", ping: "bg-blue-400", text: 'New assessment available in "Advanced JavaScript"', time: "5 hours ago" },
  { dot: "bg-orange-500", ping: "bg-orange-400", text: 'Upcoming video meeting: "Web Development Q&A"', time: "Tomorrow at 2:00 PM" },
];

// Sun → Sat
const weekly = [
  { d: "Sun", h: 2.5 },
  { d: "Mon", h: 3 },
  { d: "Tue", h: 2 },
  { d: "Wed", h: 4 },
  { d: "Thu", h: 3.5 },
  { d: "Fri", h: 1 },
  { d: "Sat", h: 1.5 },
];

/* ---------- Helpers ---------- */
const anim = (name: string, delay = 0, duration = 600) => ({
  animation: `${name} ${duration}ms cubic-bezier(.22,1,.36,1) ${delay}ms both`,
});

function useCountUp(target: number, duration = 1400, delay = 300) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }

    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => (raf = requestAnimationFrame(tick)), delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return value;
}

function StatCard({ stat, index }: { stat: (typeof stats)[number]; index: number }) {
  const { label, value, suffix, hint, icon: Icon, bg, color, glow } = stat;
  const count = useCountUp(value, 1200, 300 + index * 120);

  return (
    <div
      style={anim("sd-fade-up", 150 + index * 100)}
      className={`group cursor-default rounded-2xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${glow}`}
    >
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${bg}`}
      >
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <p className="text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-xs text-gray-400 transition-colors group-hover:text-gray-600">{hint}</p>
    </div>
  );
}

/* ---------- Page ---------- */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const rawName: string = user.name ?? "student";
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // bar, ring ityadi mount-er por animate korar jonno
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  const courseProgress = 64;
  const ringR = 40;
  const ringC = 2 * Math.PI * ringR;
  const ringCount = useCountUp(courseProgress, 1400, 500);

  const maxHours = Math.max(...weekly.map((w) => w.h));
  const totalHours = weekly.reduce((s, w) => s + w.h, 0);
  const today = new Date().getDay();

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes sd-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes sd-slide-in { from { opacity: 0; transform: translateX(-20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes sd-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes sd-gradient { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        @keyframes sd-wave { 0%, 60%, 100% { transform: rotate(0) } 10%, 30% { transform: rotate(14deg) } 20%, 40% { transform: rotate(-8deg) } 50% { transform: rotate(10deg) } }
        @keyframes sd-pulse-ring { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(2.6); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) {
          [style*="sd-"] { animation: none !important; }
          .sd-motion { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* ================= Welcome banner ================= */}
      <div
        style={anim("sd-fade-up", 0, 700)}
        className="relative overflow-hidden rounded-3xl shadow-lg shadow-blue-600/20"
      >
        <div
          className="sd-motion absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_200%]"
          style={{ animation: "sd-gradient 10s ease infinite" }}
        />
        {/* floating bubbles */}
        <div
          className="sd-motion absolute -right-10 -top-12 h-52 w-52 rounded-full bg-white/10"
          style={{ animation: "sd-float 7s ease-in-out infinite" }}
        />
        <div
          className="sd-motion absolute bottom-[-60px] right-40 h-44 w-44 rounded-full bg-white/10"
          style={{ animation: "sd-float 9s ease-in-out infinite 1s" }}
        />
        <div
          className="sd-motion absolute left-1/2 top-6 h-16 w-16 rounded-full bg-white/10"
          style={{ animation: "sd-float 6s ease-in-out infinite 2s" }}
        />

        <div className="relative flex flex-col gap-6 px-8 py-10 text-white md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur">
              <Flame className="h-4 w-4 text-orange-300" />
              5 day learning streak
            </div>
            <h3 className="text-3xl font-bold">
              {greeting}, {name}!{" "}
              <span
                className="sd-motion inline-block origin-[70%_70%]"
                style={{ animation: "sd-wave 2.5s ease-in-out 0.8s 2" }}
              >
                👋
              </span>
            </h3>
            <p className="mt-3 text-blue-100">Continue your learning journey.</p>
          </div>

          <Button
            onClick={() => navigate("/student/courses")}
            className="group h-12 w-fit cursor-pointer rounded-xl bg-white px-6 text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl"
          >
            Resume Learning
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      {/* ================= Stats ================= */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </div>

      {/* ================= Continue learning + Weekly chart ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Continue learning */}
        <div
          style={anim("sd-fade-up", 550)}
          className="group rounded-2xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
        >
          <h4 className="mb-5 font-medium text-gray-900">Continue Learning</h4>
          <div className="flex items-center gap-6">
            {/* Progress ring */}
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={ringR} fill="none" strokeWidth="9" className="stroke-gray-100" />
                <circle
                  cx="50"
                  cy="50"
                  r={ringR}
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  className="sd-motion stroke-blue-600"
                  style={{
                    strokeDasharray: ringC,
                    strokeDashoffset: mounted ? ringC * (1 - courseProgress / 100) : ringC,
                    transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums text-gray-900">
                {ringCount}%
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-gray-400">In progress</p>
              <h5 className="mt-1 text-lg font-semibold text-gray-900">Advanced JavaScript</h5>
              <p className="text-sm text-gray-500">Module 4 • DOM Manipulation</p>
              <Button
                onClick={() => navigate("/student/courses")}
                className="mt-4 h-10 cursor-pointer rounded-lg bg-blue-600 px-5 text-white transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            </div>
          </div>
        </div>

        {/* Weekly chart */}
        <div
          style={anim("sd-fade-up", 650)}
          className="rounded-2xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
        >
          <div className="mb-5 flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Weekly Study Time</h4>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
              {totalHours} hrs this week
            </span>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {weekly.map((w, i) => {
              const isToday = i === today;
              return (
                <div key={w.d} className="group/bar flex flex-col items-center gap-2">
                  <div className="relative flex h-32 w-full items-end">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-0.5 text-[11px] text-white opacity-0 transition-opacity group-hover/bar:opacity-100">
                      {w.h}h
                    </span>
                    <div
                      className={`sd-motion w-full rounded-t-lg transition-all duration-300 group-hover/bar:brightness-110 ${
                        isToday
                          ? "bg-gradient-to-t from-purple-600 to-indigo-400"
                          : "bg-gradient-to-t from-blue-500 to-blue-300"
                      }`}
                      style={{
                        height: mounted ? `${(w.h / maxHours) * 100}%` : "0%",
                        transition: `height 900ms cubic-bezier(.22,1,.36,1) ${i * 80}ms, filter 300ms`,
                      }}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? "font-semibold text-purple-600" : "text-gray-500"}`}>
                    {w.d}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= Activity + Quick actions ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <div
          style={anim("sd-fade-up", 750)}
          className="rounded-2xl border bg-white p-7 shadow-sm"
        >
          <h4 className="mb-6 font-medium text-gray-900">Recent Activity</h4>

          <div className="relative">
            {/* timeline line */}
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gray-200" />

            <div className="space-y-2">
              {activities.map((a, i) => (
                <div
                  key={i}
                  style={anim("sd-slide-in", 900 + i * 150)}
                  className="relative flex gap-4 rounded-xl p-3 pl-0 transition-colors duration-200 hover:bg-gray-50"
                >
                  <div className="relative z-10 mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
                    {i === 0 && (
                      <span
                        className={`sd-motion absolute h-4 w-4 rounded-full ${a.ping}`}
                        style={{ animation: "sd-pulse-ring 2s ease-out infinite" }}
                      />
                    )}
                    <span className={`relative h-3 w-3 rounded-full ring-4 ring-white ${a.dot}`} />
                  </div>
                  <div>
                    <p className="text-gray-900">{a.text}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div
          style={anim("sd-fade-up", 850)}
          className="rounded-2xl border bg-white p-7 shadow-sm"
        >
          <h4 className="mb-6 font-medium text-gray-900">Quick Actions</h4>
          <div className="space-y-3">
            <Button
              className="group h-14 w-full cursor-pointer justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-base text-white shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30"
              onClick={() => navigate("/student/courses")}
            >
              <span className="flex items-center gap-3">
                <Compass className="h-5 w-5" />
                Browse Courses
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
            </Button>

            <Button
              variant="outline"
              className="group h-14 w-full cursor-pointer justify-between rounded-xl px-5 text-base transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md"
              onClick={() => navigate("/student/assessments")}
            >
              <span className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5" />
                View Assessments
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1.5 group-hover:opacity-100" />
            </Button>

            <Button
              variant="outline"
              className="group h-14 w-full cursor-pointer justify-between rounded-xl px-5 text-base transition-all hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-50 hover:text-green-700 hover:shadow-md"
              onClick={() => navigate("/student/meetings")}
            >
              <span className="flex items-center gap-3">
                <Video className="h-5 w-5" />
                Join Video Meeting
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1.5 group-hover:opacity-100" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}