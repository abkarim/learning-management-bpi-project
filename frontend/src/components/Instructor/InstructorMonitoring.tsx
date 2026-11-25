import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  Clock,
  Loader2,
  Send,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { anim, useCountUp, useInView, wait } from "./animations";

/* =========================================================
   Types & data
   ========================================================= */
type RangeKey = "24h" | "7d" | "30d";

const statMeta = [
  { label: "Active Users", suffix: "", icon: Users, bg: "bg-blue-100", color: "text-blue-600" },
  { label: "Course Completions", suffix: "", icon: BookOpen, bg: "bg-green-100", color: "text-green-600" },
  { label: "Avg. Session Time", suffix: " min", icon: Clock, bg: "bg-purple-100", color: "text-purple-600" },
  { label: "Engagement Rate", suffix: "%", icon: TrendingUp, bg: "bg-orange-100", color: "text-orange-500" },
];

const ranges: Record<
  RangeKey,
  {
    label: string;
    stats: { value: number; change: number }[];
    trend: { labels: string[]; values: number[] };
  }
> = {
  "24h": {
    label: "Last 24 hours",
    stats: [
      { value: 312, change: 4 },
      { value: 18, change: 2 },
      { value: 38, change: 1 },
      { value: 81, change: 1 },
    ],
    trend: {
      labels: ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "Now"],
      values: [48, 26, 120, 238, 276, 205, 312],
    },
  },
  "7d": {
    label: "Last 7 days",
    stats: [
      { value: 847, change: 12 },
      { value: 234, change: 8 },
      { value: 42, change: 5 },
      { value: 87, change: 3 },
    ],
    trend: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [610, 680, 720, 790, 760, 820, 847],
    },
  },
  "30d": {
    label: "Last 30 days",
    stats: [
      { value: 3120, change: 18 },
      { value: 986, change: 14 },
      { value: 45, change: 7 },
      { value: 85, change: -2 },
    ],
    trend: {
      labels: ["Oct 27", "Nov 1", "Nov 5", "Nov 10", "Nov 15", "Nov 20", "Nov 25"],
      values: [1900, 2100, 2350, 2600, 2750, 2980, 3120],
    },
  },
};

type ActivityKind = "completion" | "assessment" | "course" | "meeting" | "grading" | "enrollment";

interface Activity {
  id: number;
  name: string;
  action: string;
  course: string;
  time: string;
  kind: ActivityKind;
  role: "student" | "instructor";
}

const kindDot: Record<ActivityKind, string> = {
  completion: "bg-green-500",
  assessment: "bg-blue-500",
  course: "bg-purple-500",
  meeting: "bg-orange-500",
  grading: "bg-gray-500",
  enrollment: "bg-indigo-500",
};

const activities: Activity[] = [
  { id: 1, name: "Mike Johnson", action: 'Completed module "JavaScript Basics"', course: "Introduction to Web Development", time: "2026-11-25 14:30:25", kind: "completion", role: "student" },
  { id: 2, name: "Emily Davis", action: 'Started assessment "React Hooks Quiz"', course: "Advanced React Patterns", time: "2026-11-25 14:25:10", kind: "assessment", role: "student" },
  { id: 3, name: "Sarah Smith", action: 'Created new course "Machine Learning 101"', course: "Machine Learning Fundamentals", time: "2026-11-25 14:15:45", kind: "course", role: "instructor" },
  { id: 4, name: "Robert Wilson", action: 'Joined video meeting "Q&A Session"', course: "Introduction to Web Development", time: "2026-11-25 14:00:00", kind: "meeting", role: "student" },
  { id: 5, name: "John Doe", action: "Graded assignment for Mike Johnson", course: "Advanced React Patterns", time: "2026-11-25 13:45:30", kind: "grading", role: "instructor" },
  { id: 6, name: "Sophia Lee", action: 'Submitted project "Portfolio Website"', course: "Introduction to Web Development", time: "2026-11-25 13:20:12", kind: "assessment", role: "student" },
  { id: 7, name: "Daniel Kim", action: 'Enrolled in "Data Structures & Algorithms"', course: "Data Structures & Algorithms", time: "2026-11-25 12:58:40", kind: "enrollment", role: "student" },
  { id: 8, name: "Olivia Brown", action: 'Completed quiz "CSS Flexbox"', course: "Introduction to Web Development", time: "2026-11-25 12:31:05", kind: "completion", role: "student" },
  { id: 9, name: "Sarah Smith", action: 'Published course "UI/UX Design Principles"', course: "UI/UX Design Principles", time: "2026-11-25 11:47:22", kind: "course", role: "instructor" },
  { id: 10, name: "Ava Martinez", action: 'Joined video meeting "Project Review"', course: "Advanced React Patterns", time: "2026-11-25 11:02:51", kind: "meeting", role: "student" },
];

const atRisk = [
  { id: 1, name: "Ethan Clark", course: "Introduction to Web Development", reason: "No login for 6 days", engagement: 18 },
  { id: 2, name: "Henry Scott", course: "Advanced React Patterns", reason: "2 missing submissions", engagement: 31 },
  { id: 3, name: "Mia Young", course: "Data Structures & Algorithms", reason: "Quiz average below 50%", engagement: 42 },
  { id: 4, name: "Oliver Carter", course: "UI/UX Design Principles", reason: "Skipped last 2 meetings", engagement: 47 },
];

const popularCourses = [
  { name: "Introduction to Web Development", students: 456, completion: 78 },
  { name: "Advanced React Patterns", students: 312, completion: 65 },
  { name: "Data Structures & Algorithms", students: 289, completion: 82 },
  { name: "Machine Learning Fundamentals", students: 267, completion: 71 },
  { name: "UI/UX Design Principles", students: 234, completion: 88 },
];

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
];

/* =========================================================
   Helpers
   ========================================================= */
/** Scroll-reveal wrapper */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: (inView: boolean) => ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.1);
  return (
    <div
      ref={ref}
      style={inView ? anim("imn-fade-up", delay, 700) : { opacity: 0 }}
      className={className}
    >
      {children(inView)}
    </div>
  );
}

/* =========================================================
   Stat box
   ========================================================= */
function StatBox({
  meta,
  stat,
  index,
}: {
  meta: (typeof statMeta)[number];
  stat: { value: number; change: number };
  index: number;
}) {
  const count = useCountUp(stat.value, true, 1200, 250 + index * 120);
  const Icon = meta.icon;
  const up = stat.change >= 0;

  return (
    <Card
      style={anim("imn-fade-up", index * 100)}
      className="group cursor-default gap-0 py-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${meta.bg}`}
          >
            <Icon className={`h-6 w-6 ${meta.color}`} />
          </div>
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              up ? "text-green-600" : "text-red-500"
            }`}
          >
            {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {up ? "+" : ""}
            {stat.change}%
          </span>
        </div>
        <p className="mt-5 text-gray-500">{meta.label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
          {count.toLocaleString()}
          {meta.suffix}
        </p>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   Trend chart (SVG area chart)
   ========================================================= */
function TrendChart({ labels, values }: { labels: string[]; values: number[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const [hover, setHover] = useState<number | null>(null);

  const n = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // 0-100 coordinate system (SVG preserveAspectRatio="none" diye responsive)
  const pts = values.map((v, i) => ({
    x: (i / (n - 1)) * 100,
    y: 88 - ((v - min) / (max - min || 1)) * 66,
  }));

  const line = pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const mid = (prev.x + p.x) / 2;
    return `${d} C ${mid} ${prev.y}, ${mid} ${p.y}, ${p.x} ${p.y}`;
  }, "");
  const area = `${line} L 100 100 L 0 100 Z`;

  const zoneW = 100 / (n - 1);

  return (
    <div ref={ref}>
      <div className="relative h-60 w-full">
        {/* grid lines */}
        {[22, 38.5, 55, 71.5, 88].map((y) => (
          <div
            key={y}
            className="absolute inset-x-0 border-t border-dashed border-gray-200"
            style={{ top: `${y}%` }}
          />
        ))}

        {/* line + area (left theke right-e reveal hoy) */}
        <div
          className="imn-motion absolute inset-0"
          style={{
            clipPath: inView ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            transition: "clip-path 1600ms cubic-bezier(.22,1,.36,1)",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="imn-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="imn-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#imn-area)" />
            <path
              d={line}
              fill="none"
              stroke="url(#imn-line)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* dots */}
        {pts.map((p, i) => (
          <span
            key={i}
            className="imn-motion pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-blue-600 bg-white shadow"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: inView ? 1 : 0,
              transform: `translate(-50%, -50%) scale(${hover === i ? 1.5 : 1})`,
              transition: `opacity 400ms ease ${700 + i * 130}ms, transform 200ms ease`,
            }}
          />
        ))}

        {/* hover zones */}
        {pts.map((p, i) => (
          <div
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onTouchStart={() => setHover(i)}
            className="absolute inset-y-0 cursor-pointer"
            style={{ left: `calc(${p.x}% - ${zoneW / 2}%)`, width: `${zoneW}%` }}
          />
        ))}

        {/* tooltip */}
        {hover !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg"
            style={{
              left: `${Math.min(Math.max(pts[hover].x, 9), 91)}%`,
              top: `calc(${pts[hover].y}% - 14px)`,
            }}
          >
            <span className="text-gray-300">{labels[hover]}:</span>{" "}
            <span className="font-semibold">{values[hover].toLocaleString()} users</span>
          </div>
        )}
      </div>

      {/* X labels */}
      <div className="mt-3 flex justify-between text-xs text-gray-500">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Activity row
   ========================================================= */
function ActivityRow({ a, index }: { a: Activity; index: number }) {
  return (
    <div
      style={anim("imn-slide-in", index * 70)}
      className="group flex gap-3 rounded-xl bg-gray-50 p-4 transition-colors duration-200 hover:bg-blue-50/60"
    >
      <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${kindDot[a.kind]}`} />
      <div className="min-w-0">
        <p className="text-gray-900">{a.name}</p>
        <p className="text-[15px] text-gray-700">{a.action}</p>
        <p className="mt-1 text-xs text-gray-500">{a.course}</p>
        <p className="text-xs text-gray-400">{a.time}</p>
      </div>
    </div>
  );
}

/* =========================================================
   Page
   ========================================================= */
export default function InstructorMonitoring() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [filter, setFilter] = useState<"all" | "student" | "instructor">("all");
  const [viewAllOpen, setViewAllOpen] = useState(false);

  // at-risk reminder state
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<number[]>([]);

  // live system metrics (simulated)
  const [live, setLive] = useState({ connections: 1247, api: 45, db: 23 });

  useEffect(() => {
    const id = window.setInterval(() => {
      setLive((p) => ({
        connections: Math.max(1100, p.connections + Math.round((Math.random() - 0.5) * 40)),
        api: Math.max(30, Math.min(85, p.api + Math.round((Math.random() - 0.5) * 8))),
        db: Math.max(10, Math.min(60, p.db + Math.round((Math.random() - 0.5) * 4))),
      }));
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  const current = ranges[range];
  const peak = Math.max(...current.trend.values);
  const feed = activities.filter((a) => filter === "all" || a.role === filter);

  const sendReminder = async (s: (typeof atRisk)[number]) => {
    if (sendingId !== null) return;
    setSendingId(s.id);
    await wait(1100);
    setSendingId(null);
    setSentIds((prev) => [...prev, s.id]);
    toast.success(`Reminder sent to ${s.name}`);
  };

  const storagePct = Math.round((145 / 500) * 100);

  const metrics: {
    label: string;
    value: string;
    ok: boolean;
    bar?: number;
    pulse?: boolean;
  }[] = [
    { label: "Server Status", value: "Operational", ok: true, pulse: true },
    { label: "API Response Time", value: `${live.api}ms`, ok: live.api < 100 },
    { label: "Database Load", value: `${live.db}%`, ok: live.db < 70, bar: live.db },
    { label: "Storage Used", value: "145 GB / 500 GB", ok: storagePct <= 25, bar: storagePct },
    { label: "Active Connections", value: live.connections.toLocaleString(), ok: true },
    { label: "Error Rate", value: "0.02%", ok: true },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes imn-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes imn-slide-in { from { opacity: 0; transform: translateX(-16px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes imn-ping { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(2.6); opacity: 0 } }
        @keyframes imn-shimmer { from { transform: translateX(-120%) } to { transform: translateX(300%) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="imn-"] { animation: none !important; }
          .imn-motion { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Header */}
      <div
        style={anim("imn-fade-up", 0)}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-gray-700">Monitor platform activity, student engagement and system health</p>
        <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <SelectTrigger className="h-11 w-full bg-white sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ranges) as RangeKey[]).map((k) => (
              <SelectItem key={k} value={k}>
                {ranges[k].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats (range bodlale abar animate hoy) */}
      <div key={`stats-${range}`} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statMeta.map((m, i) => (
          <StatBox key={m.label} meta={m} stat={current.stats[i]} index={i} />
        ))}
      </div>

      {/* Trend + at-risk */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Reveal className="xl:col-span-2">
          {() => (
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-lg">
              <CardContent className="p-7">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg text-gray-900">Active Users Trend</h4>
                    <p className="mt-1 text-sm text-gray-500">{current.label}</p>
                  </div>
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 px-3 py-1 text-blue-600">
                    Peak {peak.toLocaleString()}
                  </Badge>
                </div>
                <TrendChart key={range} labels={current.trend.labels} values={current.trend.values} />
              </CardContent>
            </Card>
          )}
        </Reveal>

        <Reveal delay={120}>
          {() => (
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-lg">
              <CardContent className="p-7">
                <div className="mb-5 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <h4 className="text-lg text-gray-900">Needs Attention</h4>
                </div>
                <p className="-mt-3 mb-5 text-sm text-gray-500">
                  Students with low engagement
                </p>

                <div className="space-y-4">
                  {atRisk.map((s, i) => {
                    const sent = sentIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        style={anim("imn-slide-in", 200 + i * 90)}
                        className="group rounded-xl border p-4 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/40"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarColors[s.id % avatarColors.length]}`}
                          >
                            {s.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-gray-900">{s.name}</p>
                            <p className="truncate text-xs text-gray-500">{s.course}</p>
                            <p className="mt-1 text-xs font-medium text-orange-600">{s.reason}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={sent || sendingId !== null}
                            onClick={() => sendReminder(s)}
                            className={`h-8 shrink-0 cursor-pointer px-3 text-xs transition-all ${
                              sent
                                ? "border-green-200 bg-green-50 text-green-600 disabled:opacity-100"
                                : "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                          >
                            {sendingId === s.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : sent ? (
                              <>
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Sent
                              </>
                            ) : (
                              <>
                                <Send className="mr-1 h-3.5 w-3.5" />
                                Remind
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                              style={{ width: `${s.engagement}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-gray-500">{s.engagement}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </Reveal>
      </div>

      {/* Activity + system metrics */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent activity */}
        <Reveal>
          {() => (
            <Card className="h-full gap-0 py-0">
              <CardContent className="p-7">
                <div className="mb-5 flex items-center justify-between">
                  <h4 className="text-lg text-gray-900">Recent Activity</h4>
                  <button
                    onClick={() => setViewAllOpen(true)}
                    className="cursor-pointer text-sm text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {/* filter chips */}
                <div className="mb-4 flex gap-2">
                  {(
                    [
                      { key: "all", label: "All" },
                      { key: "student", label: "Students" },
                      { key: "instructor", label: "Instructors" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`cursor-pointer rounded-full px-4 py-1.5 text-sm transition-all ${
                        filter === key
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div key={filter} className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
                  {feed.slice(0, 6).map((a, i) => (
                    <ActivityRow key={a.id} a={a} index={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </Reveal>

        {/* System metrics */}
        <Reveal delay={120}>
          {() => (
            <Card className="h-full gap-0 py-0">
              <CardContent className="p-7">
                <div className="mb-5 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">System Metrics</h4>
                  <span className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    <span className="relative flex h-2 w-2">
                      <span
                        className="imn-motion absolute inline-flex h-full w-full rounded-full bg-green-400"
                        style={{ animation: "imn-ping 2s ease-out infinite" }}
                      />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    Live
                  </span>
                </div>

                <div className="space-y-3">
                  {metrics.map((m, i) => (
                    <div
                      key={m.label}
                      style={anim("imn-slide-in", 150 + i * 80)}
                      className="rounded-xl bg-gray-50 px-5 py-4 transition-colors duration-200 hover:bg-blue-50/60"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-700">{m.label}</span>
                        <span className="flex items-center gap-2.5 text-gray-900">
                          <span className="tabular-nums">{m.value}</span>
                          <span className="relative flex h-2.5 w-2.5">
                            {m.pulse && (
                              <span
                                className="imn-motion absolute inline-flex h-full w-full rounded-full bg-green-400"
                                style={{ animation: "imn-ping 2s ease-out infinite" }}
                              />
                            )}
                            <span
                              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                                m.ok ? "bg-green-500" : "bg-orange-500"
                              }`}
                            />
                          </span>
                        </span>
                      </div>
                      {m.bar !== undefined && (
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`imn-motion h-1.5 rounded-full transition-all duration-700 ${
                              m.ok ? "bg-green-500" : "bg-orange-500"
                            }`}
                            style={{ width: `${m.bar}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </Reveal>
      </div>

      {/* Popular courses */}
      <Reveal>
        {(inView) => (
          <Card className="gap-0 py-0">
            <CardContent className="p-7">
              <h4 className="mb-6 text-lg text-gray-900">Popular Courses</h4>
              <div className="space-y-6">
                {popularCourses.map((c, i) => (
                  <div key={c.name} className="group">
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
                      <span className="text-gray-900 transition-colors group-hover:text-blue-600">
                        {c.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {c.students} students
                        <span className="ml-4">{c.completion}% completion</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="imn-motion relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
                        style={{
                          width: inView ? `${c.completion}%` : "0%",
                          transition: `width 1200ms cubic-bezier(.22,1,.36,1) ${i * 120}ms`,
                        }}
                      >
                        <div
                          className="imn-motion absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                          style={{ animation: "imn-shimmer 2.4s ease-in-out infinite" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </Reveal>

      {/* View all dialog */}
      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>All Activity</DialogTitle>
            <DialogDescription>Latest actions across your courses today.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {activities.map((a, i) => (
              <ActivityRow key={a.id} a={a} index={i} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}