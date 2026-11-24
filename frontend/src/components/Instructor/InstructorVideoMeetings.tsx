import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { anim, wait } from "./animations";

/* =========================================================
   Types & data
   ========================================================= */
interface Meeting {
  id: number;
  title: string;
  course: string;
  instructor: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  duration: number; // minutes
  participants: number;
}

interface MeetingForm {
  title: string;
  course: string;
  date: string;
  time: string;
  duration: number;
  participants: number;
}

const courseNames = [
  "Introduction to Web Development",
  "Advanced React Patterns",
  "Data Structures & Algorithms",
  "UI/UX Design Fundamentals",
];

const initialMeetings: Meeting[] = [
  { id: 1, title: "Web Development Q&A Session", course: "Introduction to Web Development", instructor: "Sarah Smith", date: "2026-11-26", time: "14:00", duration: 60, participants: 25 },
  { id: 2, title: "React Hooks Deep Dive", course: "Advanced React Patterns", instructor: "John Doe", date: "2026-11-27", time: "10:00", duration: 90, participants: 18 },
  { id: 3, title: "Project Review Session", course: "Introduction to Web Development", instructor: "Sarah Smith", date: "2026-11-28", time: "15:00", duration: 120, participants: 12 },
];

/* =========================================================
   Helpers
   ========================================================= */
const parseDate = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
};

const startsIn = (date: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((parseDate(date).getTime() - today) / 86_400_000);
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
};

const fmtDuration = (min: number) => {
  if (min < 60) return `${min} min`;
  const hrs = +(min / 60).toFixed(1);
  return `${hrs} ${hrs === 1 ? "hour" : "hours"}`;
};

const sortMeetings = (list: Meeting[]) =>
  [...list].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-[15px]">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

/* =========================================================
   Schedule dialog
   ========================================================= */
function ScheduleDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: MeetingForm) => void;
}) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(courseNames[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [participants, setParticipants] = useState("20");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = {
    title: title.trim().length < 3 ? "Title must be at least 3 characters" : "",
    date: date ? "" : "Pick a date",
    time: time ? "" : "Pick a time",
    participants: Number(participants) >= 1 ? "" : "At least 1",
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
      date,
      time,
      duration: Number(duration),
      participants: Number(participants),
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
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>
              Students enrolled in the course will see this meeting in their list.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="m-title" className="mb-2">Meeting title</Label>
            <Input
              id="m-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Doubt Clearing Session"
              aria-invalid={submitted && !!errors.title}
            />
            {err(errors.title)}
          </div>

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="m-date" className="mb-2">Date</Label>
              <Input
                id="m-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-invalid={submitted && !!errors.date}
              />
              {err(errors.date)}
            </div>
            <div>
              <Label htmlFor="m-time" className="mb-2">Time</Label>
              <Input
                id="m-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-invalid={submitted && !!errors.time}
              />
              {err(errors.time)}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="m-people" className="mb-2">Expected participants</Label>
              <Input
                id="m-people"
                type="number"
                min={1}
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                aria-invalid={submitted && !!errors.participants}
              />
              {err(errors.participants)}
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
                  Scheduling...
                </>
              ) : (
                "Schedule Meeting"
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
export default function InstructorVideoMeetings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const rawName: string = user.name ?? "instructor";
  const myName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [code, setCode] = useState("");
  const [quickJoining, setQuickJoining] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleKey, setScheduleKey] = useState(0); // prottek bar khulle form reset

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Meeting | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const busy = quickJoining || joiningId !== null;
  const sorted = useMemo(() => sortMeetings(meetings), [meetings]);

  const quickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (!code.trim()) {
      toast.error("Please enter a meeting ID or link");
      return;
    }

    setQuickJoining(true);
    await wait(1400);
    setQuickJoining(false);
    toast.success(`Joining meeting "${code.trim()}"...`);
    setCode("");
  };

  const joinMeeting = async (m: Meeting) => {
    if (busy) return;
    setJoiningId(m.id);
    await wait(1400);
    setJoiningId(null);
    toast.success(`Joining "${m.title}"...`);
  };

  const openSchedule = () => {
    setScheduleKey((k) => k + 1);
    setScheduleOpen(true);
  };

  const handleSchedule = (data: MeetingForm) => {
    setMeetings((prev) => [{ id: Date.now(), instructor: myName, ...data }, ...prev]);
    setScheduleOpen(false);
    toast.success(`"${data.title}" scheduled`);
  };

  const askCancel = (m: Meeting) => {
    setCancelTarget(m);
    setCancelOpen(true);
  };

  const confirmCancel = async () => {
    const target = cancelTarget;
    if (!target) return;

    setRemovingId(target.id);
    await wait(350);
    setMeetings((prev) => prev.filter((m) => m.id !== target.id));
    setRemovingId(null);

    toast(`"${target.title}" cancelled`, {
      action: {
        label: "Undo",
        onClick: () => setMeetings((prev) => [target, ...prev]),
      },
    });
  };

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes ivm-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes ivm-gradient { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        @keyframes ivm-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="ivm-"] { animation: none !important; }
          .ivm-motion { animation: none !important; }
        }
      `}</style>

      {/* ================= Quick Join ================= */}
      <div
        style={anim("ivm-fade-up", 0, 700)}
        className="relative overflow-hidden rounded-2xl shadow-lg shadow-blue-600/20"
      >
        <div
          className="ivm-motion absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_200%]"
          style={{ animation: "ivm-gradient 10s ease infinite" }}
        />
        <div
          className="ivm-motion absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10"
          style={{ animation: "ivm-float 7s ease-in-out infinite" }}
        />
        <div
          className="ivm-motion absolute bottom-[-40px] left-1/3 h-28 w-28 rounded-full bg-white/10"
          style={{ animation: "ivm-float 9s ease-in-out infinite 1s" }}
        />

        <form onSubmit={quickJoin} className="relative px-6 py-7 sm:px-9">
          <h3 className="text-lg text-white">Quick Join</h3>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter meeting ID or paste meeting link"
              className="h-14 min-w-0 flex-1 rounded-xl bg-white px-5 text-[15px] text-gray-900 outline-none ring-2 ring-transparent transition-all placeholder:text-gray-400 focus:ring-white/60"
            />
            <Button
              type="submit"
              disabled={busy}
              className="h-14 cursor-pointer rounded-xl bg-white px-10 text-base text-blue-600 shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg active:scale-95 disabled:opacity-80"
            >
              {quickJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ================= Upcoming meetings ================= */}
      <div>
        <div
          style={anim("ivm-fade-up", 150)}
          className="mb-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-lg text-gray-900">Upcoming Meetings</h3>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600">
              {meetings.length}
            </Badge>
          </div>
          <Button
            onClick={openSchedule}
            className="group h-11 cursor-pointer bg-blue-600 px-5 text-white shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Schedule Meeting
          </Button>
        </div>

        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((m, i) => (
              <div key={m.id} style={anim("ivm-fade-up", 250 + Math.min(i, 8) * 100)}>
                <Card
                  className={`group relative gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/10 ${
                    removingId === m.id ? "pointer-events-none scale-90 opacity-0" : ""
                  }`}
                >
                  {/* upore slide kora gradient line */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-transform duration-500 group-hover:scale-x-100" />

                  <CardContent className="p-7">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-[17px] leading-snug text-gray-900 transition-colors group-hover:text-blue-700">
                        {m.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-blue-200 bg-blue-50 text-blue-600"
                      >
                        {startsIn(m.date)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[15px] text-gray-600">{m.course}</p>

                    <Separator className="my-5" />

                    <div className="space-y-3">
                      <Row label="Instructor" value={m.instructor} />
                      <Row label="Date" value={m.date} />
                      <Row label="Time" value={fmtTime(m.time)} />
                      <Row label="Duration" value={fmtDuration(m.duration)} />
                      <Row label="Participants" value={m.participants} />
                    </div>
                  </CardContent>

                  <CardFooter className="gap-2 px-7 pb-7 pt-0">
                    <Button
                      onClick={() => joinMeeting(m)}
                      disabled={busy}
                      className="h-11 flex-1 cursor-pointer bg-blue-600 text-base text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
                    >
                      {joiningId === m.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Video className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                          Join Meeting
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => askCancel(m)}
                      aria-label="Cancel meeting"
                      className="h-11 w-11 shrink-0 cursor-pointer border-red-200 text-red-500 transition-all hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={anim("ivm-fade-up", 0)}
            className="flex flex-col items-center rounded-2xl border border-dashed bg-white px-6 py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <Video className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">No upcoming meetings</h4>
            <p className="mt-1 text-sm text-gray-500">Schedule one for your students.</p>
            <Button
              onClick={openSchedule}
              className="mt-5 cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>
        )}
      </div>

      {/* Schedule dialog */}
      <ScheduleDialog
        key={scheduleKey}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onSave={handleSchedule}
      />

      {/* Cancel confirm */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              "{cancelTarget?.title}" will be removed from the schedule. You can undo this right
              after cancelling.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Keep meeting</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCancelOpen(false);
                confirmCancel();
              }}
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
            >
              Cancel meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}