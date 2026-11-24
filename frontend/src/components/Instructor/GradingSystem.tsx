import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  Calculator,
  Check,
  Download,
  Loader2,
  Pencil,
  RotateCcw,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* =========================================================
   Types & data
   ========================================================= */
interface ScaleRow {
  grade: string;
  min: number; // minimum % for this grade
  points: number;
  pass: boolean;
}

interface Student {
  id: number;
  name: string;
  theory: number; // /30
  practical: number; // /40
  coop: number; // /30
}

interface CourseData {
  id: string;
  name: string;
  students: Student[];
}

const DEFAULT_SCALE: ScaleRow[] = [
  { grade: "A+", min: 95, points: 4.0, pass: true },
  { grade: "A", min: 90, points: 4.0, pass: true },
  { grade: "A-", min: 85, points: 3.7, pass: true },
  { grade: "B+", min: 80, points: 3.3, pass: true },
  { grade: "B", min: 75, points: 3.0, pass: true },
  { grade: "C", min: 60, points: 2.0, pass: true },
  { grade: "F", min: 0, points: 0.0, pass: false },
];

const courses: CourseData[] = [
  {
    id: "web101",
    name: "Web Development 101",
    students: [
      { id: 1, name: "Mike Johnson", theory: 28, practical: 36, coop: 27 },
      { id: 2, name: "Emily Davis", theory: 25, practical: 38, coop: 28 },
      { id: 3, name: "Robert Wilson", theory: 22, practical: 30, coop: 20 },
      { id: 4, name: "Sophia Lee", theory: 30, practical: 39, coop: 28 },
      { id: 5, name: "Daniel Kim", theory: 26, practical: 34, coop: 25 },
      { id: 6, name: "Olivia Brown", theory: 24, practical: 32, coop: 23 },
      { id: 7, name: "Ethan Clark", theory: 18, practical: 22, coop: 15 },
      { id: 8, name: "Ava Martinez", theory: 27, practical: 35, coop: 26 },
    ],
  },
  {
    id: "react",
    name: "Advanced React",
    students: [
      { id: 1, name: "Liam Walker", theory: 29, practical: 37, coop: 28 },
      { id: 2, name: "Noah Hall", theory: 25, practical: 33, coop: 24 },
      { id: 3, name: "Mia Young", theory: 21, practical: 28, coop: 22 },
      { id: 4, name: "Lucas King", theory: 27, practical: 36, coop: 27 },
      { id: 5, name: "Isabella Wright", theory: 30, practical: 40, coop: 29 },
      { id: 6, name: "Henry Scott", theory: 16, practical: 20, coop: 18 },
    ],
  },
  {
    id: "uiux",
    name: "UI/UX Fundamentals",
    students: [
      { id: 1, name: "Charlotte Adams", theory: 26, practical: 35, coop: 27 },
      { id: 2, name: "Jack Baker", theory: 23, practical: 31, coop: 22 },
      { id: 3, name: "Amelia Nelson", theory: 28, practical: 38, coop: 26 },
      { id: 4, name: "Oliver Carter", theory: 19, practical: 27, coop: 20 },
      { id: 5, name: "Harper Mitchell", theory: 24, practical: 34, coop: 25 },
    ],
  },
];

const components = [
  { name: "Theoretical", weight: 30, points: 30, wrap: "border-blue-200 bg-blue-50", icon: "bg-blue-100 text-blue-600", title: "text-blue-900", sub: "text-blue-600", num: "text-blue-600", bar: "bg-blue-500" },
  { name: "Practical", weight: 40, points: 40, wrap: "border-green-200 bg-green-50", icon: "bg-green-100 text-green-600", title: "text-green-900", sub: "text-green-600", num: "text-green-600", bar: "bg-green-500" },
  { name: "Cooperative", weight: 30, points: 30, wrap: "border-purple-200 bg-purple-50", icon: "bg-purple-100 text-purple-600", title: "text-purple-900", sub: "text-purple-600", num: "text-purple-600", bar: "bg-purple-500" },
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
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const anim = (name: string, delay = 0, duration = 600) => ({
  animation: `${name} ${duration}ms cubic-bezier(.22,1,.36,1) ${delay}ms both`,
});

const total = (s: Student) => s.theory + s.practical + s.coop;

const gradeFor = (score: number, scale: ScaleRow[]) =>
  scale.find((r) => score >= r.min) ?? scale[scale.length - 1];

// A -> green, B -> blue, C -> orange, F -> red
const gradeStyle = (g: string) =>
  g.startsWith("A")
    ? "bg-green-100 text-green-700"
    : g.startsWith("B")
    ? "bg-blue-100 text-blue-700"
    : g.startsWith("C")
    ? "bg-orange-100 text-orange-700"
    : "bg-red-100 text-red-700";

const gradeBarColor = (g: string) =>
  g.startsWith("A")
    ? "from-green-500 to-green-400"
    : g.startsWith("B")
    ? "from-blue-500 to-blue-400"
    : g.startsWith("C")
    ? "from-orange-500 to-orange-400"
    : "from-red-500 to-red-400";

/** Element screen-e ashle true hoy (scroll korle animation shuru) */
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

function useCountUp(target: number, enabled: boolean, duration = 1200, delay = 0, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

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
  }, [target, enabled, duration, delay, decimals]);

  return value;
}

/** Scroll-reveal wrapper: screen-e ashle fade-up hoy, ar bhitore inView paoa jay */
function Section({
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
      style={inView ? anim("gs-fade-up", delay, 700) : { opacity: 0 }}
      className={className}
    >
      {children(inView)}
    </div>
  );
}

/* =========================================================
   1. Grade scale configuration (editable)
   ========================================================= */
function GradeScaleCard({
  scale,
  onSave,
}: {
  scale: ScaleRow[];
  onSave: (mins: number[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<number[]>(scale.map((r) => r.min));

  const mins = editing ? draft : scale.map((r) => r.min);
  const last = scale.length - 1;

  // protiti row valid kina: ager grade-er min theke kom, porer grade-er min theke beshi
  const invalid = draft.map((m, i) => {
    if (i === last) return false;
    const upper = i === 0 ? 101 : draft[i - 1];
    return !(m < upper && m > draft[i + 1]);
  });
  const hasError = invalid.some(Boolean);

  const startEdit = () => {
    setDraft(scale.map((r) => r.min));
    setEditing(true);
  };

  const save = () => {
    if (hasError) return;
    onSave(draft);
    setEditing(false);
    toast.success("Grade scale updated. Student grades recalculated.");
  };

  const updateMin = (i: number, raw: string) => {
    const n = Math.max(0, Math.min(100, Number(raw) || 0));
    setDraft((prev) => prev.map((v, idx) => (idx === i ? n : v)));
  };

  return (
    <Section>
      {(inView) => (
        <div className="rounded-2xl border bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-lg text-gray-900">Grade Scale Configuration</h4>
              <p className="mt-1 text-sm text-gray-500">
                {editing
                  ? "Change the minimum % for each grade, then save."
                  : "Click edit to adjust the grade boundaries."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {editing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDraft(DEFAULT_SCALE.map((r) => r.min))}
                    className="cursor-pointer text-gray-600"
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                    className="cursor-pointer"
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={save}
                    disabled={hasError}
                    className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEdit}
                  className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                >
                  <Pencil className="mr-1.5 h-4 w-4 transition-transform group-hover:-rotate-12" />
                  Edit Scale
                </Button>
              )}
            </div>
          </div>

          {editing && hasError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              Each grade's minimum must be lower than the grade above it.
            </p>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="rounded-l-lg px-4 py-3 font-semibold">Grade</th>
                  <th className="px-4 py-3 font-semibold">Range</th>
                  <th className="px-4 py-3 font-semibold">Grade Points</th>
                  <th className="rounded-r-lg px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {scale.map((row, i) => {
                  const max = i === 0 ? 100 : mins[i - 1] - 1;
                  const min = mins[i];
                  const span = Math.max(max - min + 1, 0);

                  return (
                    <tr
                      key={row.grade}
                      style={inView ? anim("gs-slide-in", 250 + i * 70) : { opacity: 0 }}
                      className="group border-b transition-colors last:border-0 hover:bg-blue-50/40"
                    >
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-md px-3 py-1 transition-transform duration-300 group-hover:scale-110 ${gradeStyle(row.grade)}`}
                        >
                          {row.grade}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {editing && i !== last ? (
                            <span className="flex items-center gap-1.5 whitespace-nowrap text-gray-700">
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={draft[i]}
                                onChange={(e) => updateMin(i, e.target.value)}
                                className={`h-8 w-16 rounded-md border px-2 text-center outline-none transition-all focus:ring-2 ${
                                  invalid[i]
                                    ? "border-red-400 bg-red-50 focus:ring-red-100"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                                }`}
                              />
                              % - {max}%
                            </span>
                          ) : (
                            <span className="w-24 whitespace-nowrap text-gray-700">
                              {min === max ? `${min}%` : `${min}% - ${max}%`}
                            </span>
                          )}

                          {/* range bar: 0-100 track-e ei grade-er jayga */}
                          <div className="relative hidden h-2 w-40 rounded-full bg-gray-100 sm:block">
                            <div
                              className={`gs-motion absolute h-2 rounded-full ${row.pass ? "bg-green-400" : "bg-red-400"}`}
                              style={{
                                left: `${min}%`,
                                width: inView ? `${span}%` : "0%",
                                transition: `width 900ms cubic-bezier(.22,1,.36,1) ${400 + i * 90}ms, left 300ms ease`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-700">{row.points.toFixed(1)}</td>
                      <td className={`px-4 py-4 font-medium ${row.pass ? "text-green-600" : "text-red-600"}`}>
                        {row.pass ? "Pass" : "Fail"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Section>
  );
}

/* =========================================================
   2. Assessment components
   ========================================================= */
function ComponentsCard() {
  return (
    <Section>
      {(inView) => <ComponentsInner inView={inView} />}
    </Section>
  );
}

function ComponentsInner({ inView }: { inView: boolean }) {
  const totalPoints = useCountUp(100, inView, 1300, 500);

  return (
    <div className="rounded-2xl border bg-white p-7 shadow-sm">
      <h4 className="text-lg text-gray-900">Assessment Components</h4>

      {/* Stacked weight bar */}
      <div className="mt-5 flex h-3.5 w-full gap-1 overflow-hidden rounded-full">
        {components.map((c, i) => (
          <div
            key={c.name}
            className={`gs-motion h-full rounded-full ${c.bar}`}
            style={{
              width: inView ? `${c.weight}%` : "0%",
              transition: `width 1100ms cubic-bezier(.22,1,.36,1) ${300 + i * 150}ms`,
            }}
            title={`${c.name} ${c.weight}%`}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {components.map((c, i) => (
          <div
            key={c.name}
            style={inView ? anim("gs-fade-up", 250 + i * 120) : { opacity: 0 }}
            className={`group cursor-default rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${c.wrap}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${c.icon}`}
              >
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <p className={`font-medium ${c.title}`}>{c.name}</p>
                <p className={`text-sm ${c.sub}`}>{c.weight}%</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className={`text-4xl font-bold tabular-nums ${c.num}`}>{c.points}</p>
              <p className={`mt-1 text-sm ${c.sub}`}>Total Points</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-6 py-5">
        <span className="font-semibold text-gray-900">Total Assessment Points</span>
        <span className="text-3xl font-bold tabular-nums text-gray-900">{totalPoints}</span>
      </div>
    </div>
  );
}

/* =========================================================
   3. Student grades table (search / filter / sort / export)
   ========================================================= */
type SortKey = "name" | "total";

function StudentGradesCard({
  course,
  scale,
}: {
  course: CourseData;
  scale: ScaleRow[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pass" | "fail">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);
  const [exporting, setExporting] = useState(false);

  const rows = useMemo(() => {
    let list = course.students.map((s) => {
      const t = total(s);
      const g = gradeFor(t, scale);
      return { ...s, total: t, grade: g.grade, pass: g.pass };
    });

    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => r.name.toLowerCase().includes(q));
    if (filter !== "all") list = list.filter((r) => (filter === "pass" ? r.pass : !r.pass));

    if (sort) {
      list = [...list].sort((a, b) => {
        const cmp = sort.key === "name" ? a.name.localeCompare(b.name) : a.total - b.total;
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [course, scale, query, filter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: key === "total" ? "desc" : "asc" };
      if (prev.dir === (key === "total" ? "desc" : "asc"))
        return { key, dir: key === "total" ? "asc" : "desc" };
      return null; // 3rd click: sort bondho
    });

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort?.key === k ? (
      sort.dir === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
      )
    ) : (
      <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
    );

  const exportGrades = () => {
    if (exporting) return;
    setExporting(true);

    const job = wait(1800).then(() => {
      const data = [
        ["Student", "Theoretical (30)", "Practical (40)", "Cooperative (30)", "Total (100)", "Grade", "Status"],
        ...rows.map((r) => [r.name, r.theory, r.practical, r.coop, r.total, r.grade, r.pass ? "Pass" : "Fail"]),
      ];
      const csv = data.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grades-${course.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });

    toast.promise(job, {
      loading: "Preparing grades export...",
      success: `${course.name} grades exported`,
      error: "Export failed",
    });
    job.finally(() => setExporting(false));
  };

  return (
    <Section>
      {(inView) => (
        <div className="rounded-2xl border bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h4 className="text-lg text-gray-900">Student Grades</h4>
              <p className="mt-1 text-sm text-gray-500">{course.name}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search student..."
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-52"
                />
              </div>

              <div className="flex rounded-lg border bg-gray-50 p-1">
                {(["all", "pass", "fail"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`cursor-pointer rounded-md px-3.5 py-1.5 text-sm capitalize transition-all ${
                      filter === f
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <Button
                onClick={exportGrades}
                disabled={exporting || rows.length === 0}
                className="h-10 cursor-pointer bg-blue-600 text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30"
              >
                {exporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Grades
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="rounded-l-lg px-4 py-3 font-semibold">
                    <button
                      onClick={() => toggleSort("name")}
                      className="flex cursor-pointer items-center gap-1.5 hover:text-blue-600"
                    >
                      Student <SortIcon k="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">Theoretical<br />(30)</th>
                  <th className="px-4 py-3 text-center font-semibold">Practical<br />(40)</th>
                  <th className="px-4 py-3 text-center font-semibold">Cooperative<br />(30)</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    <button
                      onClick={() => toggleSort("total")}
                      className="mx-auto flex cursor-pointer items-center gap-1.5 hover:text-blue-600"
                    >
                      <span>Total<br />(100)</span> <SortIcon k="total" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">Grade</th>
                  <th className="rounded-r-lg px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.id}
                    style={inView ? anim("gs-slide-in", 200 + i * 60) : { opacity: 0 }}
                    className="group border-b transition-colors last:border-0 hover:bg-blue-50/40"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${avatarColors[r.id % avatarColors.length]}`}
                        >
                          {r.name[0]}
                        </div>
                        <span className="text-gray-900">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-700">{r.theory}</td>
                    <td className="px-4 py-4 text-center text-gray-700">{r.practical}</td>
                    <td className="px-4 py-4 text-center text-gray-700">{r.coop}</td>
                    <td className="px-4 py-4">
                      <div className="mx-auto w-14 text-center">
                        <span className="font-bold text-gray-900">{r.total}</span>
                        <div className="mt-1.5 h-1 w-full rounded-full bg-gray-100">
                          <div
                            className={`gs-motion h-1 rounded-full bg-gradient-to-r ${gradeBarColor(r.grade)}`}
                            style={{
                              width: inView ? `${r.total}%` : "0%",
                              transition: `width 1000ms cubic-bezier(.22,1,.36,1) ${400 + i * 60}ms`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block min-w-8 rounded-md px-2.5 py-1 transition-transform duration-300 group-hover:scale-110 ${gradeStyle(r.grade)}`}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className={`px-4 py-4 text-center font-medium ${r.pass ? "text-green-600" : "text-red-600"}`}>
                      {r.pass ? "Pass" : "Fail"}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No students match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Section>
  );
}

/* =========================================================
   4. Stats row
   ========================================================= */
function StatBox({
  label,
  numeric,
  text,
  decimals = 0,
  suffix = "",
  icon: Icon,
  iconColor,
  valueColor,
  inView,
  index,
}: {
  label: string;
  numeric?: number;
  text?: string;
  decimals?: number;
  suffix?: string;
  icon: typeof Users;
  iconColor: string;
  valueColor: string;
  inView: boolean;
  index: number;
}) {
  const count = useCountUp(numeric ?? 0, inView && numeric !== undefined, 1200, 200 + index * 120, decimals);

  return (
    <div
      style={inView ? anim("gs-fade-up", index * 100) : { opacity: 0 }}
      className="group cursor-default rounded-xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 ${iconColor}`} />
        {label}
      </div>
      <p className={`mt-3 text-3xl font-bold tabular-nums ${valueColor}`}>
        {numeric !== undefined ? count.toFixed(decimals) : text}
        {numeric !== undefined ? suffix : ""}
      </p>
    </div>
  );
}

function StatsRow({ students, scale }: { students: Student[]; scale: ScaleRow[] }) {
  const totals = students.map(total);
  const avg = totals.reduce((s, t) => s + t, 0) / (totals.length || 1);
  const passCount = totals.filter((t) => gradeFor(t, scale).pass).length;
  const passRate = Math.round((passCount / (totals.length || 1)) * 100);
  const avgGrade = gradeFor(Math.round(avg), scale).grade;

  const [ref, inView] = useInView<HTMLDivElement>(0.2);

  return (
    <div ref={ref} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatBox label="Total Students" numeric={students.length} icon={Users} iconColor="text-blue-600" valueColor="text-gray-900" inView={inView} index={0} />
      <StatBox label="Pass Rate" numeric={passRate} suffix="%" icon={Award} iconColor="text-green-600" valueColor="text-green-600" inView={inView} index={1} />
      <StatBox label="Average Grade" text={avgGrade} icon={TrendingUp} iconColor="text-purple-600" valueColor="text-purple-600" inView={inView} index={2} />
      <StatBox label="Average Score" numeric={Number(avg.toFixed(1))} decimals={1} icon={Calculator} iconColor="text-orange-500" valueColor="text-orange-500" inView={inView} index={3} />
    </div>
  );
}

/* =========================================================
   5. Grade distribution (extra)
   ========================================================= */
function DistributionCard({ students, scale }: { students: Student[]; scale: ScaleRow[] }) {
  const counts = scale.map(
    (row) => students.filter((s) => gradeFor(total(s), scale).grade === row.grade).length
  );
  const max = Math.max(...counts, 1);

  return (
    <Section>
      {(inView) => (
        <div className="rounded-2xl border bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-lg text-gray-900">Grade Distribution</h4>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              {students.length} students
            </span>
          </div>

          <div className="mt-6 grid gap-3" style={{ gridTemplateColumns: `repeat(${scale.length}, minmax(0, 1fr))` }}>
            {scale.map((row, i) => (
              <div key={row.grade} className="group flex flex-col items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 transition-transform duration-300 group-hover:-translate-y-1">
                  {counts[i]}
                </span>
                <div className="flex h-36 w-full items-end justify-center">
                  <div
                    className={`gs-motion w-full max-w-12 rounded-t-lg bg-gradient-to-t transition-[filter] duration-300 group-hover:brightness-110 ${gradeBarColor(row.grade)}`}
                    style={{
                      height: inView ? `${Math.max((counts[i] / max) * 100, counts[i] ? 8 : 3)}%` : "0%",
                      opacity: counts[i] ? 1 : 0.35,
                      transition: `height 1000ms cubic-bezier(.22,1,.36,1) ${i * 90}ms, filter 300ms`,
                    }}
                  />
                </div>
                <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${gradeStyle(row.grade)}`}>
                  {row.grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

/* =========================================================
   Page
   ========================================================= */
export default function GradingSystem() {
  const [courseId, setCourseId] = useState(courses[0].id);
  const [scale, setScale] = useState<ScaleRow[]>(DEFAULT_SCALE);

  const course = courses.find((c) => c.id === courseId)!;

  const saveScale = (mins: number[]) =>
    setScale((prev) => prev.map((r, i) => ({ ...r, min: mins[i] })));

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes gs-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes gs-slide-in { from { opacity: 0; transform: translateX(-16px) } to { opacity: 1; transform: translateX(0) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="gs-"] { animation: none !important; }
          .gs-motion { transition: none !important; }
        }
      `}</style>

      {/* Header */}
      <div
        style={anim("gs-fade-up", 0)}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h3 className="text-lg text-gray-900">Grading System</h3>
          <p className="mt-1 text-sm text-gray-600">
            Configure grading scales and manage student assessments
          </p>
        </div>

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 text-[15px] text-gray-900 outline-none transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <GradeScaleCard scale={scale} onSave={saveScale} />
      <ComponentsCard />

      {/* key bodlale (course change) sob abar animate hoy */}
      <StudentGradesCard key={`grades-${courseId}`} course={course} scale={scale} />
      <StatsRow key={`stats-${courseId}`} students={course.students} scale={scale} />
      <DistributionCard key={`dist-${courseId}`} students={course.students} scale={scale} />
    </div>
  );
}