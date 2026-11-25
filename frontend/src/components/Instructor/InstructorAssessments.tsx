import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FolderKanban,
  GraduationCap,
  ListChecks,
  Loader2,
  PenLine,
  Pencil,
  Plus,
  Search,
  SearchX,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { anim, useCountUp, useInView, wait } from "./animations";

/* =========================================================
   Types & data
   ========================================================= */
type AType = "Quiz" | "Exam" | "Project" | "Assignment";
type AStatus = "active" | "draft" | "completed";

interface Assessment {
  id: number;
  title: string;
  course: string;
  type: AType;
  status: AStatus;
  questions: number;
  duration: number; // minutes
  passingScore: number;
  dueDate: string; // YYYY-MM-DD
  enrolled: number;
  submissions: number;
  pendingReview: number;
  avgScore: number | null;
}

interface AssessmentForm {
  title: string;
  course: string;
  type: AType;
  questions: number;
  duration: number;
  passingScore: number;
  dueDate: string;
}

const courseNames = [
  "Introduction to Web Development",
  "Advanced React Patterns",
  "Data Structures & Algorithms",
  "UI/UX Design Fundamentals",
];

const typeStyle: Record<AType, { icon: typeof ListChecks; box: string; bar: string; text: string }> = {
  Quiz: { icon: ListChecks, box: "bg-blue-100 text-blue-600", bar: "bg-blue-500", text: "text-blue-600" },
  Exam: { icon: GraduationCap, box: "bg-purple-100 text-purple-600", bar: "bg-purple-500", text: "text-purple-600" },
  Project: { icon: FolderKanban, box: "bg-orange-100 text-orange-600", bar: "bg-orange-500", text: "text-orange-600" },
  Assignment: { icon: PenLine, box: "bg-green-100 text-green-600", bar: "bg-green-500", text: "text-green-600" },
};

const statusStyle: Record<AStatus, string> = {
  active: "border-green-200 bg-green-50 text-green-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-gray-200 bg-gray-100 text-gray-600",
};

const initialAssessments: Assessment[] = [
  { id: 1, title: "HTML & CSS Fundamentals Quiz", course: "Introduction to Web Development", type: "Quiz", status: "active", questions: 20, duration: 30, passingScore: 70, dueDate: "2026-11-30", enrolled: 60, submissions: 45, pendingReview: 12, avgScore: null },
  { id: 2, title: "JavaScript Basics Assessment", course: "Introduction to Web Development", type: "Quiz", status: "active", questions: 25, duration: 45, passingScore: 75, dueDate: "2026-12-03", enrolled: 60, submissions: 28, pendingReview: 6, avgScore: null },
  { id: 3, title: "React Hooks & State Management", course: "Advanced React Patterns", type: "Project", status: "active", questions: 5, duration: 120, passingScore: 80, dueDate: "2026-12-08", enrolled: 40, submissions: 22, pendingReview: 5, avgScore: null },
  { id: 4, title: "Algorithms Midterm", course: "Data Structures & Algorithms", type: "Exam", status: "active", questions: 40, duration: 90, passingScore: 60, dueDate: "2026-11-27", enrolled: 85, submissions: 60, pendingReview: 0, avgScore: null },
  { id: 5, title: "Responsive Layout Assignment", course: "Introduction to Web Development", type: "Assignment", status: "draft", questions: 4, duration: 60, passingScore: 70, dueDate: "2026-12-15", enrolled: 60, submissions: 0, pendingReview: 0, avgScore: null },
  { id: 6, title: "Wireframe Project", course: "UI/UX Design Fundamentals", type: "Project", status: "completed", questions: 3, duration: 180, passingScore: 75, dueDate: "2026-11-10", enrolled: 42, submissions: 40, pendingReview: 0, avgScore: 84 },
  { id: 7, title: "Web Basics Quiz", course: "Introduction to Web Development", type: "Quiz", status: "completed", questions: 15, duration: 20, passingScore: 70, dueDate: "2026-10-20", enrolled: 60, submissions: 58, pendingReview: 0, avgScore: 88 },
];

/* =========================================================
   Helpers
   ========================================================= */
const parseDate = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
};

const fmtDate = (d: string) =>
  parseDate(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const daysUntil = (d: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((parseDate(d).getTime() - today) / 86_400_000);
};

const dueChip = (a: Assessment) => {
  if (a.status === "completed") return { label: "Closed", cls: "bg-gray-100 text-gray-500" };
  const days = daysUntil(a.dueDate);
  if (days < 0) return { label: "Overdue", cls: "bg-red-50 text-red-600" };
  if (days === 0) return { label: "Due today", cls: "bg-red-50 text-red-600" };
  if (days <= 3) return { label: `In ${days} day${days > 1 ? "s" : ""}`, cls: "bg-amber-50 text-amber-600" };
  return { label: `In ${days} days`, cls: "bg-blue-50 text-blue-600" };
};

/* =========================================================
   Stat box
   ========================================================= */
function StatBox({
  label,
  value,
  suffix = "",
  icon: Icon,
  bg,
  color,
  index,
  inView,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof ClipboardCheck;
  bg: string;
  color: string;
  index: number;
  inView: boolean;
}) {
  const count = useCountUp(value, inView, 1100, 150 + index * 100);

  return (
    <Card
      style={inView ? anim("ias-fade-up", index * 90) : { opacity: 0 }}
      className="group cursor-default gap-0 py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${bg}`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-gray-900">
            {count}
            {suffix}
          </p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   Assessment card
   ========================================================= */
function AssessmentCard({
  a,
  index,
  removing,
  onToggle,
  onEdit,
  onDelete,
}: {
  a: Assessment;
  index: number;
  removing: boolean;
  onToggle: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);
  const style = typeStyle[a.type];
  const TypeIcon = style.icon;
  const due = dueChip(a);
  const pct = a.enrolled ? Math.round((a.submissions / a.enrolled) * 100) : 0;

  const primaryLabel =
    a.pendingReview > 0
      ? `Review ${a.pendingReview} Submissions`
      : a.status === "completed"
      ? "View Results"
      : a.status === "draft"
      ? "Preview Assessment"
      : "View Submissions";

  const meta = [
    { icon: ListChecks, label: a.type === "Quiz" || a.type === "Exam" ? "Questions" : "Tasks", value: a.questions },
    { icon: Clock, label: "Duration", value: a.duration >= 60 ? `${+(a.duration / 60).toFixed(1)} hr` : `${a.duration} min` },
    { icon: Target, label: "Passing", value: `${a.passingScore}%` },
    { icon: Calendar, label: "Due", value: fmtDate(a.dueDate) },
  ];

  return (
    <div
      ref={ref}
      style={inView ? anim("ias-fade-up", (index % 3) * 100, 650) : { opacity: 0 }}
    >
      <Card
        className={`group relative h-full gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-600/10 ${
          removing ? "pointer-events-none scale-90 opacity-0" : ""
        }`}
      >
        {/* Left accent bar: hover-e ber hoy */}
        <div
          className={`absolute inset-y-0 left-0 w-1 origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100 ${style.bar}`}
        />

        <CardContent className="space-y-5 p-6">
          {/* Title row */}
          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${style.box}`}
            >
              <TypeIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[16px] leading-snug text-gray-900 transition-colors group-hover:text-blue-700">
                {a.title}
              </h4>
              <p className="mt-1 truncate text-sm text-gray-500">{a.course}</p>
            </div>
            <Badge variant="outline" className={`shrink-0 capitalize ${statusStyle[a.status]}`}>
              {a.status}
            </Badge>
          </div>

          {/* Type + due chip */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium ${style.text}`}>
              {a.type}
            </span>
            <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${due.cls}`}>{due.label}</span>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {meta.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
                <Icon className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="truncate text-sm text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Submissions */}
          {a.status === "draft" ? (
            <div className="rounded-lg border border-dashed px-4 py-3 text-center text-sm text-gray-400">
              Not published yet. Turn on the switch to open it for students.
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{a.submissions}</span>/{a.enrolled} submitted
                </span>
                {a.avgScore !== null ? (
                  <span className="flex items-center gap-1 font-medium text-green-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Avg {a.avgScore}%
                  </span>
                ) : (
                  a.pendingReview > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-orange-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {a.pendingReview} to review
                    </span>
                  )
                )}
              </div>
              <Progress
                value={inView ? pct : 0}
                className="h-2 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500 [&>div]:duration-1000"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-4 px-6 pb-6 pt-0">
          <Button
            variant={a.pendingReview > 0 ? "default" : "outline"}
            onClick={() => toast.info(`Opening "${a.title}"...`)}
            className={`group/btn h-10 w-full cursor-pointer transition-all ${
              a.pendingReview > 0
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-600/30"
                : "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {primaryLabel}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>

          <div className="flex w-full items-center justify-between">
            {a.status === "completed" ? (
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4" />
                Finished
              </span>
            ) : (
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600">
                <Switch checked={a.status === "active"} onCheckedChange={onToggle} />
                {a.status === "active" ? "Published" : "Draft"}
              </label>
            )}

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                aria-label="Edit assessment"
                className="h-9 w-9 cursor-pointer text-gray-500 hover:bg-blue-50 hover:text-blue-600"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                aria-label="Delete assessment"
                className="h-9 w-9 cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/* =========================================================
   Create / Edit dialog
   ========================================================= */
function AssessmentFormDialog({
  open,
  onOpenChange,
  assessment,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment | null;
  onSave: (data: AssessmentForm) => void;
}) {
  const [title, setTitle] = useState(assessment?.title ?? "");
  const [course, setCourse] = useState(assessment?.course ?? courseNames[0]);
  const [type, setType] = useState<AType>(assessment?.type ?? "Quiz");
  const [questions, setQuestions] = useState(assessment ? String(assessment.questions) : "");
  const [duration, setDuration] = useState(assessment ? String(assessment.duration) : "");
  const [passing, setPassing] = useState(assessment ? String(assessment.passingScore) : "70");
  const [dueDate, setDueDate] = useState(assessment?.dueDate ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = {
    title: title.trim().length < 3 ? "Title must be at least 3 characters" : "",
    questions: Number(questions) >= 1 ? "" : "At least 1",
    duration: Number(duration) >= 1 ? "" : "At least 1 minute",
    passing: Number(passing) >= 1 && Number(passing) <= 100 ? "" : "Between 1 and 100",
    dueDate: dueDate ? "" : "Pick a due date",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;

    setSaving(true);
    await wait(900);
    onSave({
      title: title.trim(),
      course,
      type,
      questions: Number(questions),
      duration: Number(duration),
      passingScore: Number(passing),
      dueDate,
    });
    setSaving(false);
  };

  const err = (msg: string) =>
    submitted && msg ? <p className="mt-1.5 text-xs text-red-500">{msg}</p> : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{assessment ? "Edit Assessment" : "Create Assessment"}</DialogTitle>
            <DialogDescription>
              {assessment
                ? "Update the assessment settings."
                : "New assessments start as a draft. Publish them when you're ready."}
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="a-title" className="mb-2">Title</Label>
            <Input
              id="a-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CSS Flexbox Quiz"
              aria-invalid={submitted && !!errors.title}
            />
            {err(errors.title)}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2">Course</Label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courseNames.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Quiz", "Exam", "Project", "Assignment"] as const).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="a-q" className="mb-2">Questions</Label>
              <Input id="a-q" type="number" min={1} value={questions} onChange={(e) => setQuestions(e.target.value)} aria-invalid={submitted && !!errors.questions} />
              {err(errors.questions)}
            </div>
            <div>
              <Label htmlFor="a-d" className="mb-2">Minutes</Label>
              <Input id="a-d" type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} aria-invalid={submitted && !!errors.duration} />
              {err(errors.duration)}
            </div>
            <div>
              <Label htmlFor="a-p" className="mb-2">Pass %</Label>
              <Input id="a-p" type="number" min={1} max={100} value={passing} onChange={(e) => setPassing(e.target.value)} aria-invalid={submitted && !!errors.passing} />
              {err(errors.passing)}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="a-date" className="mb-2">Due date</Label>
              <Input id="a-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-invalid={submitted && !!errors.dueDate} />
              {err(errors.dueDate)}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : assessment ? (
                "Save Changes"
              ) : (
                "Create Assessment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
   Page
   ========================================================= */
export default function InstructorAssessments() {
  const [items, setItems] = useState<Assessment[]>(initialAssessments);
  const [tab, setTab] = useState<"all" | AStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | AType>("all");
  const [query, setQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<Assessment | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Assessment | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [statsRef, statsInView] = useInView<HTMLDivElement>(0.2);

  /* ----- derived ----- */
  const counts = {
    all: items.length,
    active: items.filter((a) => a.status === "active").length,
    draft: items.filter((a) => a.status === "draft").length,
    completed: items.filter((a) => a.status === "completed").length,
  };

  const totalPending = items.reduce((s, a) => s + a.pendingReview, 0);
  const assessmentsNeedingReview = items.filter((a) => a.pendingReview > 0).length;
  const completedWithScore = items.filter((a) => a.avgScore !== null);
  const avgScore = completedWithScore.length
    ? Math.round(completedWithScore.reduce((s, a) => s + (a.avgScore ?? 0), 0) / completedWithScore.length)
    : 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => {
      const matchTab = tab === "all" || a.status === tab;
      const matchType = typeFilter === "all" || a.type === typeFilter;
      const matchQuery = !q || a.title.toLowerCase().includes(q) || a.course.toLowerCase().includes(q);
      return matchTab && matchType && matchQuery;
    });
  }, [items, tab, typeFilter, query]);

  /* ----- actions ----- */
  const openCreate = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const openEdit = (a: Assessment) => {
    setEditing(a);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const handleSave = (data: AssessmentForm) => {
    if (editing) {
      setItems((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...data } : a)));
      toast.success(`"${data.title}" updated`);
    } else {
      setItems((prev) => [
        {
          id: Date.now(),
          ...data,
          status: "draft",
          enrolled: 50,
          submissions: 0,
          pendingReview: 0,
          avgScore: null,
        },
        ...prev,
      ]);
      toast.success(`"${data.title}" created as draft`);
    }
    setFormOpen(false);
  };

  const togglePublish = (id: number, checked: boolean) => {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: checked ? "active" : "draft" } : a))
    );
    toast.success(checked ? "Assessment published" : "Assessment moved to draft");
  };

  const askDelete = (a: Assessment) => {
    setDeleteTarget(a);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    if (!target) return;

    const index = items.findIndex((a) => a.id === target.id);
    setRemovingId(target.id);
    await wait(350);
    setItems((prev) => prev.filter((a) => a.id !== target.id));
    setRemovingId(null);

    toast(`"${target.title}" deleted`, {
      action: {
        label: "Undo",
        onClick: () =>
          setItems((prev) => {
            const copy = [...prev];
            copy.splice(Math.min(index, copy.length), 0, target);
            return copy;
          }),
      },
    });
  };

  const stats = [
    { label: "Total Assessments", value: items.length, icon: ClipboardCheck, bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Active Now", value: counts.active, icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
    { label: "Pending Review", value: totalPending, icon: AlertCircle, bg: "bg-orange-100", color: "text-orange-500" },
    { label: "Average Score", value: avgScore, suffix: "%", icon: TrendingUp, bg: "bg-purple-100", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes ias-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes ias-gradient { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        @keyframes ias-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes ias-ping { 0% { transform: scale(1); opacity: .7 } 100% { transform: scale(2.6); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) {
          [style*="ias-"] { animation: none !important; }
          .ias-motion { animation: none !important; }
        }
      `}</style>

      {/* Header */}
      <div
        style={anim("ias-fade-up", 0)}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-gray-700">Create, publish and review assessments for your courses</p>
        <Button
          onClick={openCreate}
          className="group h-11 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-white shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30"
        >
          <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          Create Assessment
        </Button>
      </div>

      {/* Needs attention banner */}
      {totalPending > 0 && (
        <div
          style={anim("ias-fade-up", 100, 700)}
          className="relative overflow-hidden rounded-2xl shadow-lg shadow-orange-500/20"
        >
          <div
            className="ias-motion absolute inset-0 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 bg-[length:200%_200%]"
            style={{ animation: "ias-gradient 9s ease infinite" }}
          />
          <div
            className="ias-motion absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10"
            style={{ animation: "ias-float 7s ease-in-out infinite" }}
          />
          <div className="relative flex flex-col gap-4 px-7 py-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="relative flex h-3 w-3 shrink-0">
                <span
                  className="ias-motion absolute inline-flex h-full w-full rounded-full bg-white"
                  style={{ animation: "ias-ping 2s ease-out infinite" }}
                />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
              </span>
              <div>
                <p className="text-lg font-semibold">Needs your attention</p>
                <p className="text-sm text-white/85">
                  {totalPending} submissions are waiting for review across {assessmentsNeedingReview} assessments.
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setTab("active");
                toast.info("Showing active assessments with pending reviews");
              }}
              className="group h-10 w-fit cursor-pointer bg-white px-5 text-orange-600 shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-lg"
            >
              Start reviewing
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatBox key={s.label} {...s} index={i} inView={statsInView} />
        ))}
      </div>

      {/* Tabs + filters */}
      <div style={anim("ias-fade-up", 250)} className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | AStatus)}>
            <TabsList className="h-11">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "draft", label: "Draft" },
                  { key: "completed", label: "Completed" },
                ] as const
              ).map(({ key, label }) => (
                <TabsTrigger key={key} value={key} className="cursor-pointer gap-2 px-4">
                  {label}
                  <span className="rounded-full bg-gray-200/80 px-2 py-0.5 text-xs text-gray-600">
                    {counts[key]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assessments or courses..."
              className="h-11 bg-white pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | AType)}>
            <SelectTrigger className="h-11 w-full bg-white sm:w-48">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Quiz">Quiz</SelectItem>
              <SelectItem value="Exam">Exam</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
              <SelectItem value="Assignment">Assignment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((a, i) => (
            <AssessmentCard
              key={a.id}
              a={a}
              index={i}
              removing={removingId === a.id}
              onToggle={(checked) => togglePublish(a.id, checked)}
              onEdit={() => openEdit(a)}
              onDelete={() => askDelete(a)}
            />
          ))}
        </div>
      ) : (
        <div
          style={anim("ias-fade-up", 0)}
          className="flex flex-col items-center rounded-2xl border border-dashed bg-white px-6 py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
            <SearchX className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-medium text-gray-900">No assessments found</h4>
          <p className="mt-1 text-sm text-gray-500">Try another tab, type or search.</p>
          <Button
            variant="outline"
            onClick={() => {
              setTab("all");
              setTypeFilter("all");
              setQuery("");
            }}
            className="mt-5 cursor-pointer"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Create / Edit */}
      <AssessmentFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        assessment={editing}
        onSave={handleSave}
      />

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be removed
              {deleteTarget && deleteTarget.submissions > 0
                ? ` along with ${deleteTarget.submissions} student submissions`
                : ""}
              . You can undo this right after deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteOpen(false); // dialog age bondho kori, tarpor delete cholbe
                confirmDelete();
              }}
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}