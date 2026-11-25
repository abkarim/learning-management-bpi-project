import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarPlus,
  ClipboardCheck,
  PlusCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ---------- Data ---------- */
const stats = [
  { label: "My Courses", value: 8, suffix: "", hint: "2 drafts", icon: BookOpen, bg: "bg-blue-100", color: "text-blue-600", glow: "hover:shadow-blue-500/20 hover:border-blue-300" },
  { label: "Total Students", value: 247, suffix: "", hint: "+12 this week", icon: Users, bg: "bg-green-100", color: "text-green-600", glow: "hover:shadow-green-500/20 hover:border-green-300" },
  { label: "Pending Assessments", value: 23, suffix: "", hint: "15 new today", icon: Award, bg: "bg-orange-100", color: "text-orange-500", glow: "hover:shadow-orange-500/20 hover:border-orange-300" },
  { label: "Completion Rate", value: 87, suffix: "%", hint: "+3% vs last month", icon: TrendingUp, bg: "bg-purple-100", color: "text-purple-600", glow: "hover:shadow-purple-500/20 hover:border-purple-300" },
];

const activities = [
  { dot: "bg-blue-500", ping: "bg-blue-400", text: 'New student enrolled in "Web Development 101"', time: "1 hour ago" },
  { dot: "bg-orange-500", ping: "bg-orange-400", text: "15 assessments submitted for review", time: "3 hours ago" },
  { dot: "bg-green-500", ping: "bg-green-400", text: 'Course "Advanced React" published successfully', time: "1 day ago" },
];

const coursePerformance = [
  { name: "Web Development 101", students: 86, rate: 92, bar: "from-blue-500 to-blue-400" },
  { name: "Advanced React", students: 64, rate: 84, bar: "from-indigo-500 to-indigo-400" },
  { name: "UI/UX Fundamentals", students: 52, rate: 79, bar: "from-purple-500 to-purple-400" },
  { name: "Node.js & Express", students: 45, rate: 71, bar: "from-orange-500 to-orange-400" },
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
      style={anim("idb-fade-up", 150 + index * 100)}
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
export default function InstructorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const rawName: string = user.name ?? "instructor";
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // bar-gulo mount-er por animate korar jonno
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes idb-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes idb-slide-in { from { opacity: 0; transform: translateX(-20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes idb-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes idb-gradient { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        @keyframes idb-wave { 0%, 60%, 100% { transform: rotate(0) } 10%, 30% { transform: rotate(14deg) } 20%, 40% { transform: rotate(-8deg) } 50% { transform: rotate(10deg) } }
        @keyframes idb-ping { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(2.6); opacity: 0 } }
        @keyframes idb-shimmer { from { transform: translateX(-120%) } to { transform: translateX(300%) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="idb-"] { animation: none !important; }
          .idb-motion { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* ================= Welcome banner ================= */}
      <div
        style={anim("idb-fade-up", 0, 700)}
        className="relative overflow-hidden rounded-3xl shadow-lg shadow-blue-600/20"
      >
        <div
          className="idb-motion absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_200%]"
          style={{ animation: "idb-gradient 10s ease infinite" }}
        />
        <div
          className="idb-motion absolute -right-10 -top-12 h-52 w-52 rounded-full bg-white/10"
          style={{ animation: "idb-float 7s ease-in-out infinite" }}
        />
        <div
          className="idb-motion absolute bottom-[-60px] right-40 h-44 w-44 rounded-full bg-white/10"
          style={{ animation: "idb-float 9s ease-in-out infinite 1s" }}
        />
        <div
          className="idb-motion absolute left-1/2 top-6 h-16 w-16 rounded-full bg-white/10"
          style={{ animation: "idb-float 6s ease-in-out infinite 2s" }}
        />

        <div className="relative flex flex-col gap-6 px-8 py-10 text-white md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="idb-motion absolute inline-flex h-full w-full rounded-full bg-orange-300"
                  style={{ animation: "idb-ping 2s ease-out infinite" }}
                />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-300" />
              </span>
              15 submissions waiting for review
            </div>
            <h3 className="text-3xl font-bold">
              {greeting}, {name}!{" "}
              <span
                className="idb-motion inline-block origin-[70%_70%]"
                style={{ animation: "idb-wave 2.5s ease-in-out 0.8s 2" }}
              >
                👋
              </span>
            </h3>
            <p className="mt-3 text-blue-100">Track student progress and manage your courses.</p>
          </div>

          <Button
            onClick={() => navigate("/instructor/grading")}
            className="group h-12 w-fit cursor-pointer rounded-xl bg-white px-6 text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl"
          >
            Start Grading
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

      {/* ================= Course performance ================= */}
      <div
        style={anim("idb-fade-up", 550)}
        className="rounded-2xl border bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
      >
        <div className="mb-6 flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Course Performance</h4>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            Completion rate
          </span>
        </div>

        <div className="space-y-5">
          {coursePerformance.map((c, i) => (
            <div key={c.name} className="group">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-800 transition-colors group-hover:text-blue-600">
                  {c.name}
                </span>
                <span className="text-gray-500">
                  {c.students} students • <span className="font-semibold text-gray-900">{c.rate}%</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`idb-motion relative h-2.5 overflow-hidden rounded-full bg-gradient-to-r ${c.bar}`}
                  style={{
                    width: mounted ? `${c.rate}%` : "0%",
                    transition: `width 1200ms cubic-bezier(.22,1,.36,1) ${i * 120}ms`,
                  }}
                >
                  <div
                    className="idb-motion absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    style={{ animation: "idb-shimmer 2.4s ease-in-out infinite" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Activity + Quick actions ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <div style={anim("idb-fade-up", 650)} className="rounded-2xl border bg-white p-7 shadow-sm">
          <h4 className="mb-6 font-medium text-gray-900">Recent Activity</h4>

          <div className="relative">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gray-200" />

            <div className="space-y-2">
              {activities.map((a, i) => (
                <div
                  key={i}
                  style={anim("idb-slide-in", 800 + i * 150)}
                  className="relative flex gap-4 rounded-xl p-3 pl-0 transition-colors duration-200 hover:bg-gray-50"
                >
                  <div className="relative z-10 mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
                    {i === 0 && (
                      <span
                        className={`idb-motion absolute h-4 w-4 rounded-full ${a.ping}`}
                        style={{ animation: "idb-ping 2s ease-out infinite" }}
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
        <div style={anim("idb-fade-up", 750)} className="rounded-2xl border bg-white p-7 shadow-sm">
          <h4 className="mb-6 font-medium text-gray-900">Quick Actions</h4>
          <div className="space-y-3">
            <Button
              className="group h-14 w-full cursor-pointer justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-base text-white shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30"
              onClick={() => navigate("/instructor/courses")}
            >
              <span className="flex items-center gap-3">
                <PlusCircle className="h-5 w-5" />
                Create New Course
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
            </Button>

            <Button
              variant="outline"
              className="group h-14 w-full cursor-pointer justify-between rounded-xl px-5 text-base transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md"
              onClick={() => navigate("/instructor/grading")}
            >
              <span className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5" />
                Grade Assessments
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1.5 group-hover:opacity-100" />
            </Button>

            <Button
              variant="outline"
              className="group h-14 w-full cursor-pointer justify-between rounded-xl px-5 text-base transition-all hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-50 hover:text-green-700 hover:shadow-md"
              onClick={() => navigate("/instructor/meetings")}
            >
              <span className="flex items-center gap-3">
                <CalendarPlus className="h-5 w-5" />
                Schedule Meeting
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1.5 group-hover:opacity-100" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}