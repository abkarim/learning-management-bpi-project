import { useState } from "react";
import {
  Archive,
  Check,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Lock,
  Pause,
  Play,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ---------- Types ---------- */
type ModuleType = "video" | "document" | "lesson";

interface Module {
  id: number;
  title: string;
  duration: number; // minutes
  type: ModuleType;
  description: string;
  completed: boolean;
  locked: boolean;
  offline: boolean;
}

interface Resource {
  id: number;
  name: string;
  size: string;
  kind: "pdf" | "zip";
  downloaded: boolean;
}

interface Course {
  id: number;
  title: string;
  modules: Module[];
  resources: Resource[];
}

/* ---------- Mock data ---------- */
const initialCourses: Course[] = [
  {
    id: 1,
    title: "Introduction to Web Development",
    modules: [
      { id: 1, title: "Getting Started with HTML", duration: 15, type: "lesson", description: "Learn the fundamentals of HTML and how to structure web pages.", completed: true, locked: false, offline: true },
      { id: 2, title: "CSS Fundamentals", duration: 20, type: "lesson", description: "Style your pages with selectors, the box model and flexbox.", completed: true, locked: false, offline: false },
      { id: 3, title: "JavaScript Basics", duration: 25, type: "lesson", description: "Variables, functions and control flow in JavaScript.", completed: true, locked: false, offline: false },
      { id: 4, title: "DOM Manipulation", duration: 30, type: "video", description: "Select, create and update elements using the DOM API.", completed: false, locked: false, offline: false },
      { id: 5, title: "Project: Build a Todo App", duration: 45, type: "document", description: "Put everything together by building a small Todo application.", completed: false, locked: false, offline: false },
      { id: 6, title: "Advanced JavaScript", duration: 35, type: "video", description: "Closures, promises and async/await explained.", completed: false, locked: true, offline: false },
    ],
    resources: [
      { id: 1, name: "HTML Cheat Sheet.pdf", size: "2.4 MB", kind: "pdf", downloaded: true },
      { id: 2, name: "Practice Exercises.zip", size: "1.8 MB", kind: "zip", downloaded: false },
      { id: 3, name: "CSS Flexbox Guide.pdf", size: "1.2 MB", kind: "pdf", downloaded: false },
    ],
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    modules: [
      { id: 1, title: "Closures & Scope", duration: 20, type: "video", description: "How lexical scope and closures really work.", completed: true, locked: false, offline: false },
      { id: 2, title: "Prototypes & Classes", duration: 25, type: "lesson", description: "Understand the prototype chain and ES6 classes.", completed: false, locked: false, offline: false },
      { id: 3, title: "Async Programming", duration: 30, type: "video", description: "Callbacks, promises and async/await.", completed: false, locked: true, offline: false },
    ],
    resources: [
      { id: 1, name: "JS Interview Questions.pdf", size: "3.1 MB", kind: "pdf", downloaded: false },
      { id: 2, name: "Starter Code.zip", size: "0.9 MB", kind: "zip", downloaded: false },
    ],
  },
  {
    id: 3,
    title: "UI/UX Fundamentals",
    modules: [
      { id: 1, title: "Design Principles", duration: 18, type: "lesson", description: "Hierarchy, contrast, spacing and alignment.", completed: true, locked: false, offline: false },
      { id: 2, title: "Wireframing", duration: 22, type: "document", description: "Turn ideas into low-fidelity wireframes.", completed: true, locked: false, offline: false },
      { id: 3, title: "Prototyping in Figma", duration: 28, type: "video", description: "Build clickable prototypes in Figma.", completed: false, locked: false, offline: false },
    ],
    resources: [{ id: 1, name: "Design Checklist.pdf", size: "1.0 MB", kind: "pdf", downloaded: false }],
  },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const firstOpenModule = (c: Course) =>
  (c.modules.find((m) => !m.completed && !m.locked) ?? c.modules[0]).id;

/* ---------- Component ---------- */
export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [courseId, setCourseId] = useState(initialCourses[0].id);
  const [currentId, setCurrentId] = useState(firstOpenModule(initialCourses[0]));
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState(false);

  const course = courses.find((c) => c.id === courseId)!;
  const current = course.modules.find((m) => m.id === currentId) ?? course.modules[0];

  const completedCount = course.modules.filter((m) => m.completed).length;
  const progress = Math.round((completedCount / course.modules.length) * 100);

  const courseOffline =
    course.modules.filter((m) => !m.locked).every((m) => m.offline) &&
    course.resources.every((r) => r.downloaded);

  const updateCourse = (fn: (c: Course) => Course) =>
    setCourses((prev) => prev.map((c) => (c.id === courseId ? fn(c) : c)));

  /* Download helper: loading spinner + toast */
  const runDownload = (key: string, label: string, work: () => void, ms = 1800) => {
    if (downloading.has(key)) return;

    setDownloading((prev) => new Set(prev).add(key));

    const job = wait(ms).then(work);

    toast.promise(job, {
      loading: `Downloading ${label}...`,
      success: `${label} downloaded for offline use`,
      error: "Download failed. Please try again.",
    });

    job.finally(() =>
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      })
    );
  };

  const downloadModule = (m: Module) =>
    runDownload(`${courseId}-m-${m.id}`, `"${m.title}"`, () =>
      updateCourse((c) => ({
        ...c,
        modules: c.modules.map((x) => (x.id === m.id ? { ...x, offline: true } : x)),
      }))
    );

  const downloadResource = (r: Resource) =>
    runDownload(`${courseId}-r-${r.id}`, r.name, () =>
      updateCourse((c) => ({
        ...c,
        resources: c.resources.map((x) => (x.id === r.id ? { ...x, downloaded: true } : x)),
      }))
    , 1500);

  const downloadCourse = () =>
    runDownload(
      `${courseId}-course`,
      `"${course.title}"`,
      () =>
        updateCourse((c) => ({
          ...c,
          modules: c.modules.map((m) => (m.locked ? m : { ...m, offline: true })),
          resources: c.resources.map((r) => ({ ...r, downloaded: true })),
        })),
      3200
    );

  const selectModule = (m: Module) => {
    if (m.locked) {
      toast.error("Complete the previous module to unlock this one");
      return;
    }
    setCurrentId(m.id);
    setPlaying(false);
  };

  const changeCourse = (id: number) => {
    const next = courses.find((c) => c.id === id)!;
    setCourseId(id);
    setCurrentId(firstOpenModule(next));
    setPlaying(false);
  };

  const markComplete = () => {
    const index = course.modules.findIndex((m) => m.id === current.id);
    const nextModule = course.modules[index + 1];

    updateCourse((c) => ({
      ...c,
      modules: c.modules.map((m) => {
        if (m.id === current.id) return { ...m, completed: true };
        if (nextModule && m.id === nextModule.id) return { ...m, locked: false };
        return m;
      }),
    }));

    toast.success(`"${current.title}" marked as complete 🎉`);

    if (nextModule) {
      setCurrentId(nextModule.id);
      setPlaying(false);
    }
  };

  const courseDownloading = downloading.has(`${courseId}-course`);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm lg:flex-row">
      {/* ================= Left panel ================= */}
      <aside className="w-full shrink-0 border-b lg:w-80 lg:border-b-0 lg:border-r">
        <div className="space-y-4 border-b p-4">
          <select
            value={courseId}
            onChange={(e) => changeCourse(Number(e.target.value))}
            className="h-11 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-[15px] text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-blue-600">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button
            onClick={downloadCourse}
            disabled={courseDownloading || courseOffline}
            className={`h-10 w-full cursor-pointer text-white ${
              courseOffline ? "bg-green-700 opacity-90" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {courseDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading course...
              </>
            ) : courseOffline ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Downloaded for Offline
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Course for Offline
              </>
            )}
          </Button>
        </div>

        {/* Module list */}
        <div className="space-y-2 p-4">
          {course.modules.map((m) => {
            const isCurrent = m.id === current.id;
            const isDownloading = downloading.has(`${courseId}-m-${m.id}`);

            const StatusIcon = m.locked
              ? Lock
              : m.completed
              ? CheckCircle2
              : m.type === "video"
              ? Video
              : FileText;

            return (
              <div
                key={m.id}
                onClick={() => selectModule(m)}
                className={`flex items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                  m.locked
                    ? "cursor-not-allowed border-transparent bg-gray-50 opacity-60"
                    : isCurrent
                    ? "cursor-pointer border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                    : "cursor-pointer border-transparent hover:bg-gray-50"
                }`}
              >
                <StatusIcon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    m.locked ? "text-gray-400" : m.completed ? "text-green-600" : "text-gray-600"
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Module {m.id}</p>
                  <p className="text-sm font-medium text-gray-900">{m.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{m.duration} min</span>
                    {m.offline && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Download className="h-3 w-3" />
                        Offline
                      </span>
                    )}
                  </div>
                </div>

                {/* Per-module download button */}
                {!m.locked && !m.offline && (
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadModule(m);
                    }}
                    className="mt-1 cursor-pointer text-blue-600 hover:text-blue-700 disabled:cursor-wait"
                    aria-label={`Download ${m.title}`}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ================= Right content ================= */}
      <section className="min-w-0 flex-1 space-y-6 bg-gray-50 p-4 md:p-6">
        {/* Player */}
        {current.type === "document" ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border bg-white text-center">
            <FileText className="mb-3 h-14 w-14 text-blue-600" />
            <p className="font-medium text-gray-900">{current.title}</p>
            <p className="text-sm text-gray-500">Reading material • {current.duration} min</p>
          </div>
        ) : (
          <div className="relative flex aspect-video w-full items-center justify-center rounded-xl bg-[#0b1020]">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-105"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="h-8 w-8 text-gray-900" />
              ) : (
                <Play className="ml-1 h-8 w-8 text-gray-900" />
              )}
            </button>

            {current.offline && (
              <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-green-600/90 px-3 py-1 text-xs font-medium text-white">
                <Download className="h-3 w-3" />
                Available offline
              </span>
            )}
            {playing && (
              <span className="absolute bottom-4 left-4 text-sm text-white/80">
                Playing: {current.title}
              </span>
            )}
          </div>
        )}

        {/* Title + complete */}
        <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{current.title}</h3>
            <p className="mt-2 text-gray-600">{current.description}</p>
          </div>

          {current.completed ? (
            <Button disabled className="shrink-0 bg-green-600 text-white opacity-90">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completed
            </Button>
          ) : (
            <Button
              onClick={markComplete}
              className="shrink-0 cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
            >
              Mark as Complete
            </Button>
          )}
        </div>

        {/* Resources */}
        <div className="rounded-xl border bg-white p-6">
          <h4 className="mb-4 font-medium text-gray-900">Resources</h4>
          <div className="space-y-3">
            {course.resources.map((r) => {
              const isDownloading = downloading.has(`${courseId}-r-${r.id}`);
              const Icon = r.kind === "zip" ? Archive : FileText;

              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.name}
                        {r.downloaded && (
                          <span className="ml-2 text-xs font-normal text-green-600">
                            Downloaded
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{r.size}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isDownloading || r.downloaded}
                    onClick={() => downloadResource(r)}
                    className="cursor-pointer text-blue-600 hover:text-blue-700 disabled:cursor-default"
                    aria-label={`Download ${r.name}`}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : r.downloaded ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}