import { useEffect, useState } from "react";
import { Award, CheckCircle2, ChevronRight, Target, X } from "lucide-react";

/* ---------- Types & constants ---------- */
const LEVELS = ["Novice", "Practitioner", "Proficient", "Expert"] as const;

type Category = "Technical" | "Soft Skills";
type EvidenceType = "Assessment" | "Practical" | "Project";

interface Evidence {
  type: EvidenceType;
  title: string;
  date: string;
  score: number;
}

interface Competency {
  id: number;
  title: string;
  description: string;
  category: Category;
  current: number; // LEVELS index
  target: number; // LEVELS index
  progress: number; // %
  evidence: Evidence[];
}

/* ---------- Mock data ---------- */
const competencies: Competency[] = [
  {
    id: 1,
    title: "Web Development Fundamentals",
    description: "Understanding of HTML, CSS, and JavaScript basics",
    category: "Technical",
    current: 1,
    target: 2,
    progress: 75,
    evidence: [
      { type: "Assessment", title: "HTML & CSS Fundamentals Quiz", date: "2026-09-15", score: 88 },
      { type: "Project", title: "Portfolio Website", date: "2026-10-02", score: 90 },
      { type: "Practical", title: "CSS Layout Challenge", date: "2026-10-12", score: 78 },
    ],
  },
  {
    id: 2,
    title: "React Framework",
    description: "Proficiency in React components, hooks, and state management",
    category: "Technical",
    current: 0,
    target: 1,
    progress: 40,
    evidence: [{ type: "Project", title: "React Hooks Mini Project", date: "2026-10-30", score: 72 }],
  },
  {
    id: 3,
    title: "Problem Solving",
    description: "Ability to analyze and solve complex technical problems",
    category: "Technical",
    current: 1,
    target: 2,
    progress: 60,
    evidence: [
      { type: "Assessment", title: "Algorithm Challenge", date: "2026-10-10", score: 85 },
      { type: "Practical", title: "Debugging Exercise", date: "2026-10-19", score: 82 },
    ],
  },
  {
    id: 4,
    title: "Communication Skills",
    description: "Clear written and verbal communication within teams",
    category: "Soft Skills",
    current: 2,
    target: 2,
    progress: 100,
    evidence: [
      { type: "Practical", title: "Team Presentation", date: "2026-09-28", score: 94 },
      { type: "Assessment", title: "Peer Review Report", date: "2026-10-22", score: 91 },
    ],
  },
  {
    id: 5,
    title: "Teamwork & Collaboration",
    description: "Working effectively with others to reach shared goals",
    category: "Soft Skills",
    current: 0,
    target: 1,
    progress: 30,
    evidence: [{ type: "Project", title: "Group Project Contribution", date: "2026-11-01", score: 76 }],
  },
];

/* ---------- Style helpers ---------- */
const levelBadge = (i: number) =>
  [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
  ][i];

const evidenceTypeBadge: Record<EvidenceType, string> = {
  Assessment: "bg-blue-50 text-blue-600",
  Practical: "bg-indigo-50 text-indigo-600",
  Project: "bg-purple-50 text-purple-600",
};

const scoreBadge = (s: number) =>
  s >= 85 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700";

type NodeState = "done" | "target" | "todo";

const nodeState = (i: number, current: number, target: number): NodeState =>
  i <= current ? "done" : i === target ? "target" : "todo";

/* ---------- Page ---------- */
export default function CompetencyTracker() {
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [selected, setSelected] = useState<Competency | null>(null);

  const overall = Math.round(
    competencies.reduce((s, c) => s + c.progress, 0) / competencies.length
  );
  const achieved = competencies.filter((c) => c.current >= c.target).length;

  const visible = competencies.filter((c) => filter === "All" || c.category === filter);

  // Overall bar + number 0 theke target porjonto smoothly animate hoy
  const [animatedOverall, setAnimatedOverall] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const id = requestAnimationFrame(() => setAnimatedOverall(overall));
      return () => cancelAnimationFrame(id);
    }

    const duration = 1600; // ms
    const delay = 250; // page load-er por ektu opekkha
    let raf = 0;
    let start: number | null = null;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      setAnimatedOverall(Math.round(easeOutCubic(t) * overall));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [overall]);

  // Modal open thakle Esc diye close + background scroll lock
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  return (
    <div className="space-y-7">
      {/* Modal animation keyframes */}
      <style>{`
        @keyframes ct-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ct-pop { from { opacity: 0; transform: scale(.95) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes ct-shimmer { from { transform: translateX(-100%) } to { transform: translateX(300%) } }
        @media (prefers-reduced-motion: reduce) { .ct-shimmer { animation: none !important } }
      `}</style>

      <p className="text-gray-700">
        Track competency development and achievement levels
      </p>

      {/* Overall banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-7 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Overall Competency Progress</h3>
            <p className="mt-2 text-blue-100">
              {achieved} of {competencies.length} competencies achieved
            </p>
          </div>
          <p className="text-5xl font-bold tabular-nums">{animatedOverall}%</p>
        </div>
        <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="relative h-3 overflow-hidden rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.8)]"
            style={{ width: `${animatedOverall}%` }}
          >
            {/* cholte thaka shimmer */}
            <div
              className="ct-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent"
              style={{ animation: "ct-shimmer 1.8s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-3">
        {(["All", "Technical", "Soft Skills"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`cursor-pointer rounded-lg border px-6 py-2.5 text-[15px] transition-all duration-200 ${
              filter === f
                ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {visible.map((c) => (
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(c)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(c)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-7 shadow-sm outline-none transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/10 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {/* hover-e upor theke halka blue glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-transform duration-300 group-hover:scale-x-100" />

            {/* Title */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg text-gray-900 transition-colors group-hover:text-blue-700">
                  {c.title}
                </h4>
                <p className="mt-1.5 text-sm text-gray-600">{c.description}</p>
                <span className="mt-3 inline-block rounded bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                  {c.category}
                </span>
              </div>
              <div className="rounded-full p-2 text-blue-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-blue-50">
                <Award className="h-6 w-6" />
              </div>
            </div>

            {/* Levels */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Current Level</span>
                <span className={`rounded-md px-3 py-1 text-sm ${levelBadge(c.current)}`}>
                  {LEVELS[c.current]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Target Level</span>
                <span className={`rounded-md px-3 py-1 text-sm ${levelBadge(c.target)}`}>
                  {LEVELS[c.target]}
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="mt-6 flex items-center gap-1.5">
              {LEVELS.map((lvl, i) => {
                const state = nodeState(i, c.current, c.target);
                return (
                  <div key={lvl} className="flex flex-1 items-center gap-1.5 last:flex-none">
                    <div
                      className={`h-0.5 flex-1 rounded-full ${
                        i <= c.current ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                    <StepNode state={state} />
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-gray-700">Progress</span>
              <span className="text-blue-600">{c.progress}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${c.progress}%` }}
              />
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {c.evidence.length} evidence items
              </span>
              <span className="flex items-center gap-0.5 text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2">
                View details
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= Modal ================= */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          style={{ animation: "ct-fade .2s ease-out" }}
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"
            style={{ animation: "ct-pop .25s ease-out" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selected.title}</h3>
                <p className="mt-2 text-gray-600">{selected.description}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Level progression */}
            <div className="mt-6 rounded-xl bg-gray-50 p-5">
              <h4 className="font-medium text-gray-900">Level Progression</h4>
              <div className="mt-4 flex items-start justify-between">
                {LEVELS.map((lvl, i) => {
                  const state = nodeState(i, selected.current, selected.target);
                  return (
                    <div key={lvl} className="flex w-20 flex-col items-center gap-2">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full ${
                          state === "done"
                            ? "bg-green-500 text-white"
                            : state === "target"
                            ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {state === "done" ? (
                          <CheckCircle2 className="h-7 w-7" />
                        ) : state === "target" ? (
                          <Target className="h-7 w-7" />
                        ) : (
                          <span className="h-6 w-6 rounded-full border-2 border-gray-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-700">{lvl}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Achieved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Target
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Upcoming
                </span>
                <span className="ml-auto text-blue-600">{selected.progress}% progress</span>
              </div>
            </div>

            {/* Supporting evidence */}
            <h4 className="mb-3 mt-7 font-medium text-gray-900">Supporting Evidence</h4>
            <div className="space-y-3">
              {selected.evidence.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`rounded px-2 py-0.5 text-xs ${evidenceTypeBadge[e.type]}`}>
                        {e.type}
                      </span>
                      <span className="text-gray-900">{e.title}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{e.date}</p>
                  </div>
                  <span className={`rounded-md px-3 py-1.5 text-sm ${scoreBadge(e.score)}`}>
                    {e.score}%
                  </span>
                </div>
              ))}
              {selected.evidence.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">
                  No evidence submitted yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Stepper node (card-er jonno) ---------- */
function StepNode({ state }: { state: NodeState }) {
  if (state === "done")
    return <CheckCircle2 className="h-5 w-5 shrink-0 rounded-full bg-white text-green-500" />;
  if (state === "target")
    return <Target className="h-5 w-5 shrink-0 rounded-full bg-white text-blue-600" />;
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300 bg-white" />;
}