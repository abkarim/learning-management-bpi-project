import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ---------- Types ---------- */
type AssessmentType = "Quiz" | "Project" | "Exam";

interface AvailableAssessment {
  id: number;
  title: string;
  course: string;
  type: AssessmentType;
  questions: number;
  duration: string;
  passingScore: number;
  dueDate: string;
}

interface CompletedAssessment {
  id: number;
  title: string;
  course: string;
  type: AssessmentType;
  score: number;
  passingScore: number;
  completedOn: string;
}

/* ---------- Mock data ---------- */
const availableAssessments: AvailableAssessment[] = [
  { id: 1, title: "HTML & CSS Fundamentals Quiz", course: "Introduction to Web Development", type: "Quiz", questions: 20, duration: "30 min", passingScore: 70, dueDate: "2026-11-25" },
  { id: 2, title: "JavaScript Basics Assessment", course: "Introduction to Web Development", type: "Quiz", questions: 25, duration: "45 min", passingScore: 75, dueDate: "2026-11-28" },
  { id: 3, title: "React Hooks & State Management", course: "Advanced React Patterns", type: "Project", questions: 5, duration: "2 hours", passingScore: 80, dueDate: "2026-12-01" },
];

const completedAssessments: CompletedAssessment[] = [
  { id: 4, title: "Web Basics Quiz", course: "Introduction to Web Development", type: "Quiz", score: 92, passingScore: 70, completedOn: "2026-10-20" },
  { id: 5, title: "CSS Layout Challenge", course: "Introduction to Web Development", type: "Project", score: 85, passingScore: 75, completedOn: "2026-10-28" },
  { id: 6, title: "Algorithms Midterm", course: "Data Structures", type: "Exam", score: 58, passingScore: 60, completedOn: "2026-11-02" },
];

const typeBadge: Record<AssessmentType, string> = {
  Quiz: "bg-blue-50 text-blue-600",
  Project: "bg-blue-50 text-blue-600",
  Exam: "bg-purple-50 text-purple-600",
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---------- Small pieces ---------- */
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-[15px]">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

function CardHeader({
  title,
  course,
  type,
}: {
  title: string;
  course: string;
  type: AssessmentType;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 flex-1">
        <h3 className="text-[17px] leading-snug text-gray-900">{title}</h3>
        <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs ${typeBadge[type]}`}>{type}</span>
      </div>
      <p className="mt-4 text-[15px] text-gray-600">{course}</p>
      <div className="my-5 border-t" />
    </>
  );
}

/* ---------- Page ---------- */
export default function Assessments() {
  const [tab, setTab] = useState<"available" | "completed">("available");
  const [starting, setStarting] = useState<number | null>(null);

  const startAssessment = async (a: AvailableAssessment) => {
    if (starting !== null) return;
    setStarting(a.id);
    await wait(1200);
    setStarting(null);
    toast.success(`"${a.title}" is ready. Good luck! 🍀`);
  };

  const tabs = [
    { key: "available", label: "Available Assessments" },
    { key: "completed", label: "Completed" },
  ] as const;

  return (
    <div className="space-y-7">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px cursor-pointer border-b-2 px-5 py-3 text-[15px] transition-colors ${
              tab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-700 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Available */}
      {tab === "available" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {availableAssessments.map((a) => (
            <div key={a.id} className="rounded-xl border bg-white p-7 shadow-sm flex flex-col">
              <CardHeader title={a.title} course={a.course} type={a.type} />

              <div className="space-y-3">
                <Row label="Questions" value={a.questions} />
                <Row label="Duration" value={a.duration} />
                <Row label="Passing Score" value={`${a.passingScore}%`} />
                <Row label="Due Date" value={a.dueDate} />
              </div>

              <Button
                onClick={() => startAssessment(a)}
                disabled={starting !== null}
                className="mt-6 h-11 w-full cursor-pointer bg-blue-600 text-base text-white hover:bg-blue-700"
              >
                {starting === a.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start Assessment"
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {tab === "completed" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {completedAssessments.map((a) => {
            const passed = a.score >= a.passingScore;
            return (
              <div key={a.id} className="rounded-xl border bg-white p-7 shadow-sm ">
                <CardHeader title={a.title} course={a.course} type={a.type} />

                <div className="space-y-3">
                  <Row label="Your Score" value={`${a.score}%`} />
                  <Row label="Passing Score" value={`${a.passingScore}%`} />
                  <Row label="Completed On" value={a.completedOn} />
                  <div className="flex items-center justify-between text-[15px]">
                    <span className="text-gray-600">Result</span>
                    <span
                      className={`flex items-center gap-1.5 font-medium ${
                        passed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {passed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => toast.info(`Opening review for "${a.title}"...`)}
                  className="mt-6 h-11 w-full cursor-pointer text-base"
                >
                  Review Answers
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}