import { useState } from "react";
import { Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ---------- Types & data ---------- */
interface Meeting {
  id: number;
  title: string;
  course: string;
  instructor: string;
  date: string; // YYYY-MM-DD
  time: string;
  duration: string;
  participants: number;
}

const meetings: Meeting[] = [
  { id: 1, title: "Web Development Q&A Session", course: "Introduction to Web Development", instructor: "Sarah Smith", date: "2026-11-22", time: "2:00 PM", duration: "1 hour", participants: 25 },
  { id: 2, title: "React Hooks Deep Dive", course: "Advanced React Patterns", instructor: "John Doe", date: "2026-11-23", time: "10:00 AM", duration: "1.5 hours", participants: 18 },
  { id: 3, title: "Project Review Session", course: "Introduction to Web Development", instructor: "Sarah Smith", date: "2026-11-24", time: "3:00 PM", duration: "2 hours", participants: 12 },
];

/* ---------- Helpers ---------- */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const anim = (delay = 0, duration = 600) => ({
  animation: `vm-fade-up ${duration}ms cubic-bezier(.22,1,.36,1) ${delay}ms both`,
});

// "In 12 days" / "Tomorrow" / "Today"
const startsIn = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((target - today) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-[15px]">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

/* ---------- Page ---------- */
export default function VideoMeetings() {
  const [code, setCode] = useState("");
  const [quickJoining, setQuickJoining] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const busy = quickJoining || joiningId !== null;

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

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes vm-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes vm-gradient { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        @keyframes vm-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="vm-"] { animation: none !important; }
          .vm-motion { animation: none !important; }
        }
      `}</style>

      <p style={anim(0)} className="text-gray-700">
        Schedule and join video meetings for your courses
      </p>

      {/* ================= Quick Join ================= */}
      <div
        style={anim(100, 700)}
        className="relative overflow-hidden rounded-2xl shadow-lg shadow-blue-600/20"
      >
        <div
          className="vm-motion absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_200%]"
          style={{ animation: "vm-gradient 10s ease infinite" }}
        />
        <div
          className="vm-motion absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10"
          style={{ animation: "vm-float 7s ease-in-out infinite" }}
        />
        <div
          className="vm-motion absolute bottom-[-40px] left-1/3 h-28 w-28 rounded-full bg-white/10"
          style={{ animation: "vm-float 9s ease-in-out infinite 1s" }}
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
        <h3 style={anim(200)} className="mb-5 text-lg text-gray-900">
          Upcoming Meetings
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {meetings.map((m, i) => {
            const joining = joiningId === m.id;
            return (
              <div
                key={m.id}
                style={anim(300 + i * 120)}
                className="group relative overflow-hidden rounded-xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/10"
              >
                {/* upore slide kora gradient line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-transform duration-500 group-hover:scale-x-100" />

                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-[17px] leading-snug text-gray-900 transition-colors group-hover:text-blue-700">
                    {m.title}
                  </h4>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-600">
                    {startsIn(m.date)}
                  </span>
                </div>
                <p className="mt-2 text-[15px] text-gray-600">{m.course}</p>

                <div className="my-5 border-t" />

                <div className="space-y-3">
                  <Row label="Instructor" value={m.instructor} />
                  <Row label="Date" value={m.date} />
                  <Row label="Time" value={m.time} />
                  <Row label="Duration" value={m.duration} />
                  <Row label="Participants" value={m.participants} />
                </div>

                <Button
                  onClick={() => joinMeeting(m)}
                  disabled={busy}
                  className="mt-6 h-11 w-full cursor-pointer bg-blue-600 text-base text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
                >
                  {joining ? (
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}