import { useState } from "react";
import { Award, CheckCircle2, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { anim, useCountUp, useInView } from "./animations";

/* =========================================================
   Types & data
   ========================================================= */
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
    category: "Soft Skills",
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
    title: "Team Collaboration",
    description: "Working effectively in team environments",
    category: "Soft Skills",
    current: 2,
    target: 2,
    progress: 100,
    evidence: [
      { type: "Project", title: "Group Capstone Project", date: "2026-09-28", score: 94 },
      { type: "Practical", title: "Peer Code Review", date: "2026-10-22", score: 91 },
    ],
  },
  {
    id: 5,
    title: "Database Design",
    description: "Modeling data, normalization and writing efficient SQL",
    category: "Technical",
    current: 0,
    target: 1,
    progress: 30,
    evidence: [{ type: "Assessment", title: "ER Modeling Quiz", date: "2026-11-01", score: 68 }],
  },
];

/* =========================================================
   Style helpers
   ========================================================= */
const levelBadge = (i: number) =>
  [
    "border-blue-200 bg-blue-50 text-blue-700",
    "border-green-200 bg-green-50 text-green-700",
    "border-purple-200 bg-purple-50 text-purple-700",
    "border-orange-200 bg-orange-50 text-orange-700",
  ][i];

const evidenceTypeBadge: Record<EvidenceType, string> = {
  Assessment: "border-blue-200 bg-blue-50 text-blue-600",
  Practical: "border-indigo-200 bg-indigo-50 text-indigo-600",
  Project: "border-purple-200 bg-purple-50 text-purple-600",
};

const scoreBadge = (s: number) =>
  s >= 85
    ? "border-green-200 bg-green-50 text-green-700"
    : "border-blue-200 bg-blue-50 text-blue-700";

type NodeState = "done" | "target" | "todo";

const nodeState = (i: number, current: number, target: number): NodeState =>
  i <= current ? "done" : i === target ? "target" : "todo";

function StepNode({ state }: { state: NodeState }) {
  if (state === "done")
    return <CheckCircle2 className="h-5 w-5 shrink-0 rounded-full bg-white text-green-500" />;
  if (state === "target")
    return <Target className="h-5 w-5 shrink-0 rounded-full bg-white text-blue-600" />;
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300 bg-white" />;
}

/* =========================================================
   Competency card
   ========================================================= */
function CompetencyCard({
  c,
  index,
  onOpen,
}: {
  c: Competency;
  index: number;
  onOpen: () => void;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);

  return (
    <div
      ref={ref}
      style={inView ? anim("icp-fade-up", (index % 2) * 90) : { opacity: 0 }}
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
        className="group h-full cursor-pointer gap-0 py-0 outline-none transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/10 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <CardContent className="p-6">
          {/* Title */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-[17px] text-gray-900 transition-colors group-hover:text-blue-700">
                {c.title}
              </h4>
              <p className="mt-1.5 text-sm text-gray-600">{c.description}</p>
              <Badge variant="secondary" className="mt-3 font-normal text-gray-700">
                {c.category}
              </Badge>
            </div>
            <Award className="h-6 w-6 shrink-0 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          </div>

          {/* Levels */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Current Level</span>
              <Badge variant="outline" className={levelBadge(c.current)}>
                {LEVELS[c.current]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Target Level</span>
              <Badge variant="outline" className={levelBadge(c.target)}>
                {LEVELS[c.target]}
              </Badge>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-6 flex items-center gap-1.5">
            {LEVELS.map((lvl, i) => (
              <div key={lvl} className="flex flex-1 items-center gap-1.5 last:flex-none">
                <div
                  className={`h-0.5 flex-1 rounded-full ${
                    i <= c.current ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
                <StepNode state={nodeState(i, c.current, c.target)} />
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-gray-700">Progress</span>
            <span className="text-blue-600">{c.progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="icp-motion relative h-2 overflow-hidden rounded-full bg-blue-600"
              style={{
                width: inView ? `${c.progress}%` : "0%",
                transition: "width 1100ms cubic-bezier(.22,1,.36,1)",
              }}
            >
              {/* cholte thaka halka shimmer */}
              <div
                className="icp-motion absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{ animation: "icp-shimmer 2.4s ease-in-out infinite" }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center gap-2 border-t pt-4 text-sm text-gray-600">
            <CheckCircle2 className="h-4 w-4" />
            {c.evidence.length} evidence item{c.evidence.length === 1 ? "" : "s"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================================================
   Page
   ========================================================= */
export default function InstructorCompetencyTracker() {
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [selected, setSelected] = useState<Competency | null>(null);
  const [open, setOpen] = useState(false);

  const [bannerRef, bannerInView] = useInView<HTMLDivElement>(0.2);

  const overall = Math.round(
    competencies.reduce((s, c) => s + c.progress, 0) / competencies.length
  );
  const achieved = competencies.filter((c) => c.current >= c.target).length;
  const animatedOverall = useCountUp(overall, bannerInView, 1500, 200);

  const visible = competencies.filter((c) => filter === "All" || c.category === filter);

  const openModal = (c: Competency) => {
    setSelected(c);
    setOpen(true);
  };

  return (
    <div className="space-y-7">
      <style>{`
        @keyframes icp-fade-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes icp-shimmer { from { transform: translateX(-120%) } to { transform: translateX(300%) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="icp-"] { animation: none !important; }
          .icp-motion { animation: none !important; transition: none !important; }
        }
      `}</style>

      <p style={anim("icp-fade-up", 0)} className="text-gray-700">
        Track competency development and achievement levels (FR-03)
      </p>

      {/* Overall banner */}
      <div
        ref={bannerRef}
        style={anim("icp-fade-up", 80, 650)}
        className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-7 text-white shadow-lg shadow-blue-600/20"
      >
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
              className="icp-motion absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent"
              style={{ animation: "icp-shimmer 1.8s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div style={anim("icp-fade-up", 160)} className="flex flex-wrap gap-3">
        {(["All", "Technical", "Soft Skills"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className={`h-11 cursor-pointer px-6 text-[15px] transition-all ${
              filter === f
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                : "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {visible.map((c, i) => (
          <CompetencyCard key={`${filter}-${c.id}`} c={c} index={i} onOpen={() => openModal(c)} />
        ))}
      </div>

      {/* Details modal (shadcn Dialog) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.title}</DialogTitle>
                <DialogDescription className="text-base">{selected.description}</DialogDescription>
              </DialogHeader>

              {/* Level progression */}
              <div className="rounded-xl bg-gray-50 p-5">
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
              <div>
                <h4 className="mb-3 font-medium text-gray-900">Supporting Evidence</h4>
                <div className="space-y-3">
                  {selected.evidence.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Badge variant="outline" className={evidenceTypeBadge[e.type]}>
                            {e.type}
                          </Badge>
                          <span className="text-gray-900">{e.title}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">{e.date}</p>
                      </div>
                      <Badge variant="outline" className={`px-3 py-1.5 text-sm ${scoreBadge(e.score)}`}>
                        {e.score}%
                      </Badge>
                    </div>
                  ))}
                  {selected.evidence.length === 0 && (
                    <p className="py-6 text-center text-sm text-gray-500">No evidence submitted yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}