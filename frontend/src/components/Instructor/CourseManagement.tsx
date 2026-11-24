import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
type Status = "published" | "draft" | "archived";

interface Course {
  id: number;
  title: string;
  description: string;
  students: number;
  modules: number;
  weeks: number;
  status: Status;
  gradient: number;
  topics: string[];
  updated: string;
}

interface CourseForm {
  title: string;
  description: string;
  status: Status;
  modules: number;
  weeks: number;
}

const gradients = [
  "from-blue-500 via-indigo-500 to-purple-600",
  "from-indigo-500 via-purple-500 to-fuchsia-500",
  "from-sky-500 via-blue-500 to-indigo-600",
  "from-violet-500 via-purple-500 to-pink-500",
  "from-cyan-500 via-blue-500 to-purple-600",
  "from-emerald-500 via-teal-500 to-blue-600",
];

const statusStyle: Record<Status, string> = {
  published: "border-green-200 bg-green-50 text-green-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  archived: "border-gray-200 bg-gray-100 text-gray-600",
};

const initialCourses: Course[] = [
  {
    id: 1,
    title: "Introduction to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript",
    students: 156,
    modules: 12,
    weeks: 8,
    status: "published",
    gradient: 0,
    topics: ["HTML Basics", "CSS Fundamentals", "Flexbox & Grid", "JavaScript Essentials", "DOM Manipulation"],
    updated: "2 days ago",
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    description: "Master advanced React concepts and patterns",
    students: 89,
    modules: 8,
    weeks: 6,
    status: "published",
    gradient: 1,
    topics: ["Component Patterns", "Hooks Deep Dive", "State Management", "Performance Optimization"],
    updated: "5 days ago",
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    description: "Comprehensive guide to DSA with practical examples",
    students: 203,
    modules: 15,
    weeks: 10,
    status: "published",
    gradient: 2,
    topics: ["Arrays & Strings", "Linked Lists", "Trees & Graphs", "Sorting Algorithms", "Dynamic Programming"],
    updated: "1 week ago",
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    description: "Design principles, wireframing and prototyping in Figma",
    students: 0,
    modules: 10,
    weeks: 6,
    status: "draft",
    gradient: 3,
    topics: ["Design Principles", "Wireframing", "Prototyping in Figma"],
    updated: "Yesterday",
  },
  {
    id: 5,
    title: "Database Design Essentials",
    description: "ER modeling, normalization and SQL from scratch",
    students: 118,
    modules: 9,
    weeks: 7,
    status: "archived",
    gradient: 5,
    topics: ["ER Modeling", "Normalization", "SQL Essentials"],
    updated: "2 months ago",
  },
];

/* =========================================================
   Small components
   ========================================================= */
function StatBox({
  label,
  value,
  icon: Icon,
  bg,
  color,
  index,
  inView,
}: {
  label: string;
  value: number;
  icon: typeof BookOpen;
  bg: string;
  color: string;
  index: number;
  inView: boolean;
}) {
  const count = useCountUp(value, inView, 1100, 150 + index * 100);

  return (
    <Card
      style={inView ? anim("cmg-fade-up", index * 90) : { opacity: 0 }}
      className="group cursor-default gap-0 py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${bg}`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-gray-900">{count}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseCard({
  course,
  index,
  view,
  removing,
  onView,
  onEdit,
  onDelete,
}: {
  course: Course;
  index: number;
  view: "grid" | "list";
  removing: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isList = view === "list";

  const meta = [
    { icon: Users, text: `${course.students} students` },
    { icon: BookOpen, text: `${course.modules} modules` },
    { icon: Clock, text: `${course.weeks} weeks` },
  ];

  return (
    // bairer div-e shudhu entrance animation, bhitore Card-e hover + remove effect
    <div style={anim("cmg-fade-up", 120 + Math.min(index, 8) * 80)}>
      <Card
        className={`group gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/10 ${
          isList ? "sm:flex-row" : ""
        } ${removing ? "pointer-events-none scale-90 opacity-0" : ""}`}
      >
        {/* Cover */}
        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br bg-[length:200%_200%] transition-all duration-700 group-hover:bg-[position:100%_50%] ${
            gradients[course.gradient % gradients.length]
          } ${isList ? "h-32 sm:h-auto sm:w-52" : "h-40"}`}
        >
          <div
            className="cmg-motion absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10"
            style={{ animation: "cmg-float 7s ease-in-out infinite" }}
          />
          <div
            className="cmg-motion absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-white/10"
            style={{ animation: "cmg-float 9s ease-in-out infinite 1s" }}
          />
          <BookOpen className="relative h-14 w-14 text-white/90 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-125" />
        </div>

        {/* Body */}
        <CardContent className={`flex flex-1 flex-col p-6 ${isList ? "sm:flex-row sm:items-center sm:gap-6" : ""}`}>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-[17px] leading-snug text-gray-900 transition-colors group-hover:text-blue-700">
                {course.title}
              </h4>
              <Badge variant="outline" className={`shrink-0 capitalize ${statusStyle[course.status]}`}>
                {course.status}
              </Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{course.description}</p>

            <Separator className="my-4" />

            <div className={isList ? "flex flex-wrap gap-x-6 gap-y-2" : "space-y-2.5"}>
              {meta.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Icon className="h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={`mt-6 flex gap-2 ${isList ? "sm:mt-0 sm:w-56 sm:shrink-0" : ""}`}>
            <Button
              onClick={onView}
              className="group/btn h-10 flex-1 cursor-pointer bg-blue-600 text-white transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30"
            >
              <Eye className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-125" />
              View
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              aria-label="Edit course"
              className="h-10 w-10 shrink-0 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              aria-label="Delete course"
              className="h-10 w-10 shrink-0 cursor-pointer border-red-200 text-red-500 transition-all hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================================================
   Create / Edit dialog
   ========================================================= */
function CourseFormDialog({
  open,
  onOpenChange,
  course,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onSave: (data: CourseForm) => void;
}) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [status, setStatus] = useState<Status>(course?.status ?? "draft");
  const [modules, setModules] = useState(course ? String(course.modules) : "");
  const [weeks, setWeeks] = useState(course ? String(course.weeks) : "");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = {
    title: title.trim().length < 3 ? "Title must be at least 3 characters" : "",
    description: description.trim().length < 10 ? "Write a short description (10+ characters)" : "",
    modules: Number(modules) >= 1 ? "" : "Enter at least 1 module",
    weeks: Number(weeks) >= 1 ? "" : "Enter at least 1 week",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;

    setSaving(true);
    await wait(900);
    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      modules: Number(modules),
      weeks: Number(weeks),
    });
    setSaving(false);
  };

  const err = (msg: string) =>
    submitted && msg ? <p className="mt-1.5 text-xs text-red-500">{msg}</p> : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{course ? "Edit Course" : "Create New Course"}</DialogTitle>
            <DialogDescription>
              {course
                ? "Update the course details below."
                : "Fill in the details to create a new course."}
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="c-title" className="mb-2">Course title</Label>
            <Input
              id="c-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Python"
              aria-invalid={submitted && !!errors.title}
            />
            {err(errors.title)}
          </div>

          <div>
            <Label htmlFor="c-desc" className="mb-2">Description</Label>
            <Textarea
              id="c-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn?"
              rows={3}
              aria-invalid={submitted && !!errors.description}
            />
            {err(errors.description)}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-2">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="c-modules" className="mb-2">Modules</Label>
              <Input
                id="c-modules"
                type="number"
                min={1}
                value={modules}
                onChange={(e) => setModules(e.target.value)}
                aria-invalid={submitted && !!errors.modules}
              />
              {err(errors.modules)}
            </div>
            <div>
              <Label htmlFor="c-weeks" className="mb-2">Weeks</Label>
              <Input
                id="c-weeks"
                type="number"
                min={1}
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                aria-invalid={submitted && !!errors.weeks}
              />
              {err(errors.weeks)}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : course ? (
                "Save Changes"
              ) : (
                "Create Course"
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
export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  // create / edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0); // prottek bar khulle form reset korar jonno
  const [editing, setEditing] = useState<Course | null>(null);

  // view dialog
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Course | null>(null);

  // delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [statsRef, statsInView] = useInView<HTMLDivElement>(0.2);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const matchQuery =
        !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [courses, query, statusFilter]);

  const stats = [
    { label: "Total Courses", value: courses.length, icon: BookOpen, bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Published", value: courses.filter((c) => c.status === "published").length, icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
    { label: "Drafts", value: courses.filter((c) => c.status === "draft").length, icon: Pencil, bg: "bg-amber-100", color: "text-amber-600" },
    { label: "Total Students", value: courses.reduce((s, c) => s + c.students, 0), icon: Users, bg: "bg-purple-100", color: "text-purple-600" },
  ];

  const openCreate = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const openView = (c: Course) => {
    setViewing(c);
    setViewOpen(true);
  };

  const askDelete = (c: Course) => {
    setDeleteTarget(c);
    setDeleteOpen(true);
  };

  const handleSave = (data: CourseForm) => {
    if (editing) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...data, updated: "Just now" } : c))
      );
      toast.success(`"${data.title}" updated`);
    } else {
      const id = Date.now();
      setCourses((prev) => [
        {
          id,
          ...data,
          students: 0,
          gradient: id % gradients.length,
          topics: [],
          updated: "Just now",
        },
        ...prev,
      ]);
      toast.success(`"${data.title}" created`);
    }
    setFormOpen(false);
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    if (!target) return;

    const index = courses.findIndex((c) => c.id === target.id);
    setRemovingId(target.id);
    await wait(350);
    setCourses((prev) => prev.filter((c) => c.id !== target.id));
    setRemovingId(null);

    toast(`"${target.title}" deleted`, {
      action: {
        label: "Undo",
        onClick: () =>
          setCourses((prev) => {
            const copy = [...prev];
            copy.splice(Math.min(index, copy.length), 0, target);
            return copy;
          }),
      },
    });
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes cmg-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes cmg-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="cmg-"] { animation: none !important; }
          .cmg-motion { animation: none !important; }
        }
      `}</style>

      {/* Header */}
      <div
        style={anim("cmg-fade-up", 0)}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-gray-700">Create and manage courses and modules</p>
        <Button
          onClick={openCreate}
          className="group h-11 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-white shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30"
        >
          <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatBox key={s.label} {...s} index={i} inView={statsInView} />
        ))}
      </div>

      {/* Filters */}
      <Card style={anim("cmg-fade-up", 200)} className="gap-0 py-0">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="h-11 pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | Status)}>
              <SelectTrigger className="h-11 w-full min-w-40 md:w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Grid / List toggle */}
            <div className="flex shrink-0 rounded-lg border bg-gray-50 p-1">
              {(
                [
                  { key: "grid", icon: LayoutGrid },
                  { key: "list", icon: List },
                ] as const
              ).map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  aria-label={`${key} view`}
                  className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-all ${
                    view === key
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses */}
      {filtered.length > 0 ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
              : "grid grid-cols-1 gap-5"
          }
        >
          {filtered.map((c, i) => (
            <CourseCard
              key={`${view}-${c.id}`}
              course={c}
              index={i}
              view={view}
              removing={removingId === c.id}
              onView={() => openView(c)}
              onEdit={() => openEdit(c)}
              onDelete={() => askDelete(c)}
            />
          ))}
        </div>
      ) : (
        <div
          style={anim("cmg-fade-up", 0)}
          className="flex flex-col items-center rounded-2xl border border-dashed bg-white px-6 py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
            <SearchX className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-medium text-gray-900">No courses found</h4>
          <p className="mt-1 text-sm text-gray-500">Try a different search or status filter.</p>
          <Button variant="outline" onClick={clearFilters} className="mt-5 cursor-pointer">
            Clear filters
          </Button>
        </div>
      )}

      {/* ---------- Create / Edit ---------- */}
      <CourseFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editing}
        onSave={handleSave}
      />

      {/* ---------- View details ---------- */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          {viewing && (
            <>
              <div
                className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${
                  gradients[viewing.gradient % gradients.length]
                }`}
              >
                <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-white/10" />
                <BookOpen className="relative h-14 w-14 text-white/90" />
              </div>

              <div className="space-y-5 p-6 pt-2">
                <DialogHeader>
                  <div className="flex items-start justify-between gap-3">
                    <DialogTitle className="text-xl">{viewing.title}</DialogTitle>
                    <Badge variant="outline" className={`shrink-0 capitalize ${statusStyle[viewing.status]}`}>
                      {viewing.status}
                    </Badge>
                  </div>
                  <DialogDescription>{viewing.description}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Students", value: viewing.students, icon: Users, color: "text-blue-600 bg-blue-50" },
                    { label: "Modules", value: viewing.modules, icon: BookOpen, color: "text-purple-600 bg-purple-50" },
                    { label: "Weeks", value: viewing.weeks, icon: Clock, color: "text-green-600 bg-green-50" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`rounded-xl p-3 text-center ${color}`}>
                      <Icon className="mx-auto mb-1 h-5 w-5" />
                      <p className="text-xl font-bold">{value}</p>
                      <p className="text-xs opacity-80">{label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h5 className="mb-3 text-sm font-semibold text-gray-900">Course outline</h5>
                  {viewing.topics.length > 0 ? (
                    <ol className="space-y-2">
                      {viewing.topics.map((t, i) => (
                        <li key={t} className="flex items-center gap-3 text-sm text-gray-700">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                            {i + 1}
                          </span>
                          {t}
                        </li>
                      ))}
                      {viewing.modules > viewing.topics.length && (
                        <li className="pl-9 text-sm text-gray-400">
                          + {viewing.modules - viewing.topics.length} more modules
                        </li>
                      )}
                    </ol>
                  ) : (
                    <p className="text-sm text-gray-400">Outline not added yet.</p>
                  )}
                </div>

                <p className="text-xs text-gray-400">Last updated {viewing.updated}</p>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewOpen(false)} className="cursor-pointer">
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setViewOpen(false);
                      openEdit(viewing);
                    }}
                    className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Course
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------- Delete confirm ---------- */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be removed
              {deleteTarget && deleteTarget.students > 0
                ? ` and ${deleteTarget.students} enrolled students will lose access`
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