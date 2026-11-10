import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Award,
  Bell,
  FileText,
  Info,
  MessageSquare,
  Search,
  Send,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ---------- Types ---------- */
interface Message {
  id: number;
  from: "me" | "them";
  text: string;
  time: string;
  sender?: string; // group chat-e kar message
}

interface Conversation {
  id: number;
  name: string;
  role: string;
  unread: number;
  messages: Message[];
}

type AlertType = "grade" | "assignment" | "meeting" | "system";

interface AlertItem {
  id: number;
  type: AlertType;
  title: string;
  text: string;
  time: string;
  read: boolean;
}

/* ---------- Mock data ---------- */
const initialConversations: Conversation[] = [
  {
    id: 1,
    name: "Sarah Smith",
    role: "Instructor",
    unread: 2,
    messages: [
      { id: 1, from: "them", text: "Hi! I reviewed your project submission. Overall great work!", time: "3 hours ago" },
      { id: 2, from: "me", text: "Thank you! I really appreciate the feedback.", time: "2 hours ago" },
      { id: 3, from: "them", text: "Great work on your recent submission!", time: "2 hours ago" },
    ],
  },
  {
    id: 2,
    name: "Web Development 101",
    role: "Course Group",
    unread: 5,
    messages: [
      { id: 1, from: "them", sender: "Anika", text: "Has anyone started the CSS assignment?", time: "6 hours ago" },
      { id: 2, from: "them", sender: "Rafi", text: "Yes, flexbox part was tricky but fun.", time: "5 hours ago" },
      { id: 3, from: "them", sender: "Mike", text: "Does anyone have the slides from last class?", time: "5 hours ago" },
    ],
  },
  {
    id: 3,
    name: "John Doe",
    role: "Instructor",
    unread: 0,
    messages: [
      { id: 1, from: "them", text: "Your assessment has been graded", time: "1 day ago" },
    ],
  },
];

const initialAlerts: AlertItem[] = [
  { id: 1, type: "grade", title: "Assessment graded", text: "Your \"React Hooks Test\" has been graded: 94%.", time: "1 hour ago", read: false },
  { id: 2, type: "assignment", title: "New assignment", text: "\"REST API Assignment\" is due on Nov 12.", time: "4 hours ago", read: false },
  { id: 3, type: "meeting", title: "Meeting reminder", text: "Web Development Q&A starts tomorrow at 2:00 PM.", time: "Yesterday", read: true },
  { id: 4, type: "system", title: "Sync completed", text: "All your offline progress was synced successfully.", time: "2 days ago", read: true },
];

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
];

const alertStyle: Record<AlertType, { icon: typeof Award; box: string }> = {
  grade: { icon: Award, box: "bg-green-100 text-green-600" },
  assignment: { icon: FileText, box: "bg-blue-100 text-blue-600" },
  meeting: { icon: Video, box: "bg-purple-100 text-purple-600" },
  system: { icon: Info, box: "bg-gray-100 text-gray-600" },
};

const lastOf = (c: Conversation) => c.messages[c.messages.length - 1];

/* ---------- Page ---------- */
export default function Communication() {
  const [tab, setTab] = useState<"messages" | "alerts">("messages");
  const [conversations, setConversations] = useState(initialConversations);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedId, setSelectedId] = useState(1);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId)!;
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const q = query.trim().toLowerCase();
  const filteredConversations = conversations.filter(
    (c) => c.name.toLowerCase().includes(q) || lastOf(c).text.toLowerCase().includes(q)
  );
  const filteredAlerts = alerts.filter(
    (a) => a.title.toLowerCase().includes(q) || a.text.toLowerCase().includes(q)
  );

  // notun message ashle ba chat bodlale niche scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selected.messages.length, selectedId, mobileView]);

  const openConversation = (id: number) => {
    setSelectedId(id);
    setMobileView("chat");
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const markAlertRead = (id: number) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              unread: 0,
              messages: [...c.messages, { id: Date.now(), from: "me", text: value, time: "Just now" }],
            }
          : c
      )
    );
    setText("");
  };

  const colorFor = (id: number) => avatarColors[id % avatarColors.length];

  return (
    <div className="flex h-[calc(100dvh-17rem)] min-h-[480px] overflow-hidden rounded-xl border bg-white shadow-sm">
      <style>{`
        @keyframes cm-msg-in { from { opacity: 0; transform: translateY(10px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @media (prefers-reduced-motion: reduce) { [style*="cm-"] { animation: none !important; } }
      `}</style>

      {/* ================= Left: list ================= */}
      <aside
        className={`${
          mobileView === "chat" ? "hidden" : "flex"
        } w-full shrink-0 flex-col border-r md:flex md:w-80 lg:w-96`}
      >
        <div className="space-y-3 p-4">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTab("messages")}
              className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-[15px] transition-all ${
                tab === "messages"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Messages
            </button>
            <button
              onClick={() => setTab("alerts")}
              className={`relative flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-[15px] transition-all ${
                tab === "alerts"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Bell className="h-4 w-4" />
              Alerts
              {unreadAlerts > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                    tab === "alerts" ? "bg-white text-blue-600" : "bg-red-500 text-white"
                  }`}
                >
                  {unreadAlerts}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "messages" ? "Search conversations..." : "Search alerts..."}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-[15px] outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto border-t">
          {tab === "messages" ? (
            <>
              {filteredConversations.map((c) => {
                const last = lastOf(c);
                const active = c.id === selectedId;
                const preview = last.sender ? `${last.sender}: ${last.text}` : last.text;

                return (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id)}
                    className={`flex w-full cursor-pointer items-start gap-3 border-b px-4 py-4 text-left transition-colors ${
                      active ? "bg-blue-50 md:border-l-4 md:border-l-blue-600" : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg ${colorFor(c.id)}`}
                    >
                      {c.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[16px] text-gray-900">{c.name}</p>
                        {c.unread > 0 && (
                          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs text-white">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{c.role}</p>
                      <p className="mt-1 truncate text-sm text-gray-700">{preview}</p>
                      <p className="mt-1 text-xs text-gray-400">{last.time}</p>
                    </div>
                  </button>
                );
              })}
              {filteredConversations.length === 0 && (
                <p className="p-8 text-center text-sm text-gray-500">No conversations found.</p>
              )}
            </>
          ) : (
            <>
              {filteredAlerts.map((a) => {
                const { icon: Icon, box } = alertStyle[a.type];
                return (
                  <button
                    key={a.id}
                    onClick={() => markAlertRead(a.id)}
                    className={`flex w-full cursor-pointer items-start gap-3 border-b px-4 py-4 text-left transition-colors hover:bg-gray-50 ${
                      a.read ? "" : "bg-blue-50/50"
                    }`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${box}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[15px] font-medium text-gray-900">{a.title}</p>
                        {!a.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600">{a.text}</p>
                      <p className="mt-1 text-xs text-gray-400">{a.time}</p>
                    </div>
                  </button>
                );
              })}
              {filteredAlerts.length === 0 && (
                <p className="p-8 text-center text-sm text-gray-500">No alerts found.</p>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ================= Right: chat ================= */}
      <section
        className={`${mobileView === "list" ? "hidden" : "flex"} min-w-0 flex-1 flex-col md:flex`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-4 md:px-6">
          <button
            onClick={() => setMobileView("list")}
            className="-ml-1 cursor-pointer rounded-full p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${colorFor(selected.id)}`}
          >
            {selected.name[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[16px] text-gray-900">{selected.name}</p>
            <p className="text-sm text-gray-500">{selected.role}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50 p-4 md:p-7">
          {selected.messages.map((m, i) => {
            const mine = m.from === "me";
            return (
              <div
                key={m.id}
                style={{ animation: `cm-msg-in 350ms cubic-bezier(.22,1,.36,1) ${Math.min(i, 6) * 60}ms both` }}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                {!mine && m.sender && (
                  <span className="mb-1 ml-1 text-xs font-medium text-gray-500">{m.sender}</span>
                )}
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-5 py-3 text-[15px] sm:max-w-[75%] ${
                    mine
                      ? "rounded-tr-md bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "rounded-tl-md border bg-white text-gray-900 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-1.5 px-1 text-xs text-gray-500">{m.time}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex items-center gap-3 border-t bg-white p-3 md:p-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-4 text-[15px] outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <Button
            type="submit"
            disabled={!text.trim()}
            className="h-11 w-14 shrink-0 cursor-pointer bg-blue-600 text-white transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 active:scale-95 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </section>
    </div>
  );
}