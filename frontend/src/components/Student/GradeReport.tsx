import { useEffect, useState } from "react";
import { AlertCircle, Award, Calendar, Download, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ---------- Types ---------- */
interface CourseGrade {
  code: string;
  title: string;
  instructor: string;
  credits: number;
  // null = result ekhono publish hoy ni
  theoretical: number | null; // out of 30
  practical: number | null; // out of 40
  cooperative: number | null; // out of 30
}

interface Semester {
  id: string;
  label: string;
  courses: CourseGrade[];
}

/* ---------- Mock data ---------- */
const semesters: Semester[] = [
  {
    id: "fall-2026",
    label: "Current Semester (Fall 2026)",
    courses: [
      { code: "CS101", title: "Introduction to Programming", instructor: "John Doe", credits: 5, theoretical: 28, practical: 36, cooperative: 27 },
      { code: "CS102", title: "Data Structures", instructor: "Sarah Smith", credits: 5, theoretical: 26, practical: 35, cooperative: 27 },
      { code: "CS103", title: "Database Systems", instructor: "Michael Brown", credits: 5, theoretical: null, practical: null, cooperative: null },
    ],
  },
  {
    id: "spring-2026",
    label: "Spring 2026",
    courses: [
      { code: "CS091", title: "Computer Fundamentals", instructor: "Anna Lee", credits: 4, theoretical: 27, practical: 38, cooperative: 28 },
      { code: "MA101", title: "Discrete Mathematics", instructor: "David Kim", credits: 4, theoretical: 24, practical: 32, cooperative: 25 },
      { code: "EN101", title: "Technical English", instructor: "Emma Wilson", credits: 3, theoretical: 25, practical: 33, cooperative: 26 },
    ],
  },
  {
    id: "fall-2025",
    label: "Fall 2025",
    courses: [
      { code: "CS001", title: "Digital Logic", instructor: "Robert Hall", credits: 4, theoretical: 22, practical: 30, cooperative: 24 },
      { code: "PH101", title: "Physics I", instructor: "Linda Park", credits: 4, theoretical: 20, practical: 28, cooperative: 22 },
    ],
  },
];

/* ---------- Helpers ---------- */
const PASS_MARK = 60;

const isGraded = (c: CourseGrade) =>
  c.theoretical !== null && c.practical !== null && c.cooperative !== null;

const total = (c: CourseGrade) =>
  (c.theoretical ?? 0) + (c.practical ?? 0) + (c.cooperative ?? 0);

const toGrade = (score: number): { letter: string; points: number } => {
  if (score >= 90) return { letter: "A", points: 4.0 };
  if (score >= 85) return { letter: "A-", points: 3.7 };
  if (score >= 80) return { letter: "B+", points: 3.3 };
  if (score >= 75) return { letter: "B", points: 3.0 };
  if (score >= 70) return { letter: "B-", points: 2.7 };
  if (score >= 60) return { letter: "C", points: 2.0 };
  return { letter: "F", points: 0 };
};

const gradeBadge = (letter: string) =>
  letter.startsWith("A")
    ? "bg-green-100 text-green-700"
    : letter.startsWith("B")
    ? "bg-blue-100 text-blue-700"
    : letter.startsWith("C")
    ? "bg-orange-100 text-orange-700"
    : "bg-red-100 text-red-700";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---------- Animation helpers ---------- */
const anim = (name: string, delay = 0, duration = 600) => ({
  animation: `${name} ${duration}ms cubic-bezier(.22,1,.36,1) ${delay}ms both`,
});

function useCountUp(target: number, duration = 1200, delay = 200, decimals = 0) {
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
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Number((eased * target).toFixed(decimals)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => (raf = requestAnimationFrame(tick)), delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay, decimals]);

  return value;
}

/* ---------- Small components ---------- */
function StatCard({
  label,
  value,
  decimals = 0,
  suffix = "",
  icon: Icon,
  box,
  text,
  hover,
  index,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  icon: typeof Award;
  box: string;
  text: string;
  hover: string;
  index: number;
}) {
  const count = useCountUp(value, 1200, 250 + index * 120, decimals);

  return (
    <div
      style={anim("gr-fade-up", 150 + index * 100)}
      className={`group relative cursor-default overflow-hidden rounded-xl border bg-gradient-to-br p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${box} ${hover}`}
    >
      {/* hover-e alo-r jholok */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/50 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className={`relative flex items-center gap-2 text-sm ${text}`}>
        <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
        <span className="text-gray-700">{label}</span>
      </div>
      <p className={`relative mt-3 text-4xl font-bold tabular-nums ${text}`}>
        {count.toFixed(decimals)}
        {suffix}
      </p>
    </div>
  );
}

function PartBox({
  name,
  value,
  max,
  wrap,
  title,
  num,
  bar,
  track,
  delay,
}: {
  name: string;
  value: number | null;
  max: number;
  wrap: string;
  title: string;
  num: string;
  bar: string;
  track: string;
  delay: number;
}) {
  const count = useCountUp(value ?? 0, 1000, delay);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setFilled(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);

  const pct = value === null ? 0 : (value / max) * 100;

  return (
    <div
      className={`group/part rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${wrap}`}
    >
      <p className={`font-medium ${title}`}>{name}</p>
      <p className={`mt-3 text-2xl font-bold tabular-nums ${num}`}>
        {value === null ? "—" : count}{" "}
        <span className="text-sm font-normal text-gray-500">/ {max}</span>
      </p>
      <div className={`mt-3 h-2 w-full overflow-hidden rounded-full ${track}`}>
        <div
          className={`gr-motion relative h-2 overflow-hidden rounded-full ${bar}`}
          style={{
            width: filled ? `${pct}%` : "0%",
            transition: "width 1100ms cubic-bezier(.22,1,.36,1)",
          }}
        >
          {value !== null && (
            <div
              className="gr-motion absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              style={{ animation: "gr-shimmer 2.4s ease-in-out infinite" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ c, index }: { c: CourseGrade; index: number }) {
  const done = isGraded(c);
  const score = total(c);
  const grade = toGrade(score);
  const passed = done && score >= PASS_MARK;
  const base = 450 + index * 180;

  const scoreCount = useCountUp(done ? score : 0, 1300, base + 150);

  const parts = [
    { name: "Theoretical", value: c.theoretical, max: 30, wrap: "bg-blue-50", title: "text-blue-900", num: "text-blue-600", bar: "bg-blue-600", track: "bg-blue-200" },
    { name: "Practical", value: c.practical, max: 40, wrap: "bg-green-50", title: "text-green-900", num: "text-green-600", bar: "bg-green-600", track: "bg-green-200" },
    { name: "Cooperative", value: c.cooperative, max: 30, wrap: "bg-purple-50", title: "text-purple-900", num: "text-purple-600", bar: "bg-purple-600", track: "bg-purple-200" },
  ];

  return (
    <div
      style={anim("gr-fade-up", base)}
      className="group relative overflow-hidden rounded-2xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10"
    >
      {/* upore slide kora gradient line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-transform duration-500 group-hover:scale-x-100" />

      {/* Top row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-lg text-gray-900 transition-colors group-hover:text-blue-700">
            {c.title} <span className="text-sm text-gray-500">({c.code})</span>
          </h4>
          <p className="mt-3 text-sm text-gray-600">Instructor: {c.instructor}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">{c.credits} credits</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                !done
                  ? "bg-orange-50 text-orange-600"
                  : passed
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {!done ? "Awaiting result" : passed ? "Passed" : "Failed"}
            </span>
          </div>
        </div>

        <div className="flex items-end gap-5">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Score</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
              {done ? scoreCount : "—"}
              <span className="text-2xl">/100</span>
            </p>
          </div>
          <div className="text-center">
            <p className="mb-1 text-sm text-gray-600">Grade</p>
            {done ? (
              <div
                style={anim("gr-pop", base + 900, 700)}
                className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${gradeBadge(grade.letter)}`}
              >
                {grade.letter}
              </div>
            ) : (
              <div
                className="gr-motion flex h-12 items-center justify-center rounded-lg bg-orange-100 px-3 text-xs font-semibold text-orange-700"
                style={{ animation: "gr-pulse 2s ease-in-out infinite" }}
              >
                Pending
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {parts.map((p, i) => (
          <PartBox key={p.name} {...p} delay={base + 300 + i * 150} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function GradeReport() {
  const [semesterId, setSemesterId] = useState(semesters[0].id);
  const [downloading, setDownloading] = useState(false);

  const semester = semesters.find((s) => s.id === semesterId)!;
  const graded = semester.courses.filter(isGraded);
  const pending = semester.courses.length - graded.length;
  const passed = graded.filter((c) => total(c) >= PASS_MARK).length;

  const totalCredits = semester.courses.reduce((s, c) => s + c.credits, 0);
  const earnedCredits = graded
    .filter((c) => total(c) >= PASS_MARK)
    .reduce((s, c) => s + c.credits, 0);

  const gradedCredits = graded.reduce((s, c) => s + c.credits, 0);
  const gpa =
    gradedCredits === 0
      ? 0
      : graded.reduce((s, c) => s + toGrade(total(c)).points * c.credits, 0) / gradedCredits;

  /* CSV report download */
  const downloadReport = () => {
    if (downloading) return;
    setDownloading(true);

    const job = wait(2000).then(() => {
      const rows = [
        ["Code", "Course", "Instructor", "Credits", "Theoretical", "Practical", "Cooperative", "Total", "Grade"],
        ...semester.courses.map((c) =>
          isGraded(c)
            ? [c.code, c.title, c.instructor, c.credits, c.theoretical, c.practical, c.cooperative, total(c), toGrade(total(c)).letter]
            : [c.code, c.title, c.instructor, c.credits, "-", "-", "-", "-", "Pending"]
        ),
      ];
      const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grade-report-${semester.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });

    toast.promise(job, {
      loading: "Preparing your grade report...",
      success: "Grade report downloaded",
      error: "Could not download the report",
    });
    job.finally(() => setDownloading(false));
  };

  // stat card-er "x/y" format-er jonno x ke animate kori, /y static suffix
  const stats = [
    { label: "GPA", value: gpa, decimals: 2, suffix: "", icon: Award, box: "from-blue-50 to-blue-100 border-blue-200", text: "text-blue-600", hover: "hover:shadow-blue-500/25" },
    { label: "Passed Courses", value: passed, decimals: 0, suffix: `/${semester.courses.length}`, icon: TrendingUp, box: "from-green-50 to-green-100 border-green-200", text: "text-green-600", hover: "hover:shadow-green-500/25" },
    { label: "Credits", value: earnedCredits, decimals: 0, suffix: `/${totalCredits}`, icon: Calendar, box: "from-purple-50 to-purple-100 border-purple-200", text: "text-purple-600", hover: "hover:shadow-purple-500/25" },
    { label: "Pending", value: pending, decimals: 0, suffix: "", icon: AlertCircle, box: "from-orange-50 to-orange-100 border-orange-200", text: "text-orange-600", hover: "hover:shadow-orange-500/25" },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes gr-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes gr-pop { 0% { opacity: 0; transform: scale(.3) rotate(-12deg) } 60% { opacity: 1; transform: scale(1.2) rotate(4deg) } 100% { opacity: 1; transform: scale(1) rotate(0) } }
        @keyframes gr-shimmer { from { transform: translateX(-120%) } to { transform: translateX(300%) } }
        @keyframes gr-pulse { 0%, 100% { opacity: 1; transform: scale(1) } 50% { opacity: .65; transform: scale(.96) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="gr-"] { animation: none !important; }
          .gr-motion { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Header */}
      <div
        style={anim("gr-fade-up", 0)}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h3 className="text-lg font-medium text-gray-900">Grade Report</h3>
          <p className="mt-1 text-sm text-gray-600">
            View your academic performance and progress
          </p>
        </div>
        <Button
          onClick={downloadReport}
          disabled={downloading}
          className="group h-11 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-white shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30"
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Download Report
            </>
          )}
        </Button>
      </div>

      {/* Semester select */}
      <div
        style={anim("gr-fade-up", 100)}
        className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <select
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 text-[15px] text-gray-900 outline-none transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stat cards: key bodlale (semester change) abar animate hoy */}
      <div
        key={`stats-${semesterId}`}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* Course cards */}
      <div key={`courses-${semesterId}`} className="space-y-6">
        {semester.courses.map((c, i) => (
          <CourseCard key={c.code} c={c} index={i} />
        ))}
      </div>
    </div>
  );
}