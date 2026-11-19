import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Wifi,
  Zap,
  Gauge,
  CloudOff,
  RefreshCw,
  HardDriveDownload,
  CheckCircle2,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const TOTAL_STEPS = 5;

type ConnectionMode = "auto" | "standard" | "low";

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [step, setStep] = useState(1);

  // Connection preferences
  const [connection, setConnection] = useState<ConnectionMode>(
    user.lowBandwidth ? "low" : "auto"
  );
  const [dataSaver, setDataSaver] = useState(!!user.lowBandwidth);

  // Notification settings
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);

  // Offline sync
  const [autoSync, setAutoSync] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [downloadLessons, setDownloadLessons] = useState(false);

  const progress = (step / TOTAL_STEPS) * 100;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const finish = () => {
    const preferences = {
      connection,
      dataSaver,
      notifications: { email, push, sms },
      offline: { autoSync, wifiOnly, downloadLessons },
    };

    localStorage.setItem("studentPreferences", JSON.stringify(preferences));
    localStorage.setItem("onboardingDone", "true");

    // low bandwidth setting user data-te update kore rakhi
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, lowBandwidth: connection === "low" || dataSaver })
    );

    toast.success("You're all set! Let's start learning 🎉");
    navigate("/student");
  };

  const skip = () => {
    localStorage.setItem("onboardingDone", "true");
    navigate("/student");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
      <Card className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-0 bg-white shadow-2xl p-0 gap-0">
        {/* Progress bar */}
        <div className="h-2 w-full bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-8 pt-10 pb-8 min-h-[520px] flex flex-col">
          {/* Step content */}
          <div className="flex-1">
            {step === 1 && <WelcomeStep name={user.name} />}

            {step === 2 && (
              <StepHeader
                icon={<Wifi className="h-10 w-10 text-blue-600" />}
                title="Connection Preferences"
                subtitle="Choose how the app should behave on your internet"
              >
                <div className="space-y-3">
                  <ChoiceCard
                    selected={connection === "auto"}
                    onClick={() => setConnection("auto")}
                    icon={<Zap className="h-5 w-5 text-blue-600" />}
                    title="Automatic"
                    desc="Adjust quality based on your connection speed"
                  />
                  <ChoiceCard
                    selected={connection === "standard"}
                    onClick={() => setConnection("standard")}
                    icon={<Gauge className="h-5 w-5 text-green-600" />}
                    title="High Quality"
                    desc="Best video and image quality, needs a fast connection"
                  />
                  <ChoiceCard
                    selected={connection === "low"}
                    onClick={() => setConnection("low")}
                    icon={<Wifi className="h-5 w-5 text-purple-600" />}
                    title="Low Bandwidth Mode"
                    desc="Text-first lessons, lighter images, less data usage"
                  />
                  <SwitchRow
                    id="data-saver"
                    icon={<Gauge className="h-5 w-5 text-orange-500" />}
                    title="Data Saver"
                    desc="Don't auto-play videos on mobile data"
                    checked={dataSaver}
                    onChange={setDataSaver}
                    color="blue"
                  />
                </div>
              </StepHeader>
            )}

            {step === 3 && (
              <StepHeader
                icon={<span className="text-5xl">🔔</span>}
                title="Notification Settings"
                subtitle="Stay updated on courses, assignments, and announcements"
              >
                <div className="space-y-3">
                  <SwitchRow
                    id="email"
                    icon={<Bell className="h-5 w-5 text-blue-600" />}
                    title="Email Notifications"
                    desc="Get updates via email"
                    checked={email}
                    onChange={setEmail}
                    color="blue"
                  />
                  <SwitchRow
                    id="push"
                    icon={<Bell className="h-5 w-5 text-green-600" />}
                    title="Push Notifications"
                    desc="Real-time alerts on your device"
                    checked={push}
                    onChange={setPush}
                    color="green"
                  />
                  <SwitchRow
                    id="sms"
                    icon={<Bell className="h-5 w-5 text-purple-600" />}
                    title="SMS Notifications"
                    desc="Critical alerts via text message"
                    checked={sms}
                    onChange={setSms}
                    color="purple"
                  />
                </div>
              </StepHeader>
            )}

            {step === 4 && (
              <StepHeader
                icon={<CloudOff className="h-10 w-10 text-indigo-600" />}
                title="Offline Sync Setup"
                subtitle="Keep learning even when your internet is down"
              >
                <div className="space-y-3">
                  <SwitchRow
                    id="auto-sync"
                    icon={<RefreshCw className="h-5 w-5 text-blue-600" />}
                    title="Auto Sync"
                    desc="Sync progress and submissions when back online"
                    checked={autoSync}
                    onChange={setAutoSync}
                    color="blue"
                  />
                  <SwitchRow
                    id="wifi-only"
                    icon={<Wifi className="h-5 w-5 text-green-600" />}
                    title="Sync on Wi-Fi only"
                    desc="Save your mobile data"
                    checked={wifiOnly}
                    onChange={setWifiOnly}
                    color="green"
                  />
                  <SwitchRow
                    id="download"
                    icon={<HardDriveDownload className="h-5 w-5 text-purple-600" />}
                    title="Download lessons for offline"
                    desc="Save enrolled course content on this device"
                    checked={downloadLessons}
                    onChange={setDownloadLessons}
                    color="purple"
                  />
                </div>
              </StepHeader>
            )}

            {step === 5 && (
              <div className="flex flex-col items-center text-center pt-4">
                <div className="rounded-full bg-green-50 p-5 mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
                <p className="text-gray-500 mt-2 max-w-md">
                  Your preferences are saved. You can change them anytime from your profile settings.
                </p>

                <div className="mt-6 w-full space-y-2 text-left text-sm">
                  <SummaryRow
                    label="Connection"
                    value={
                      connection === "auto"
                        ? "Automatic"
                        : connection === "standard"
                        ? "High Quality"
                        : "Low Bandwidth"
                    }
                  />
                  <SummaryRow
                    label="Notifications"
                    value={
                      [email && "Email", push && "Push", sms && "SMS"]
                        .filter(Boolean)
                        .join(", ") || "None"
                    }
                  />
                  <SummaryRow
                    label="Offline sync"
                    value={autoSync ? (wifiOnly ? "On (Wi-Fi only)" : "On") : "Off"}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 border-t pt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={prev}
              disabled={step === 1}
              className={`cursor-pointer text-gray-600 ${step === 1 ? "invisible" : ""}`}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i + 1 === step
                      ? "w-2.5 bg-blue-600"
                      : i + 1 < step
                      ? "w-2 bg-blue-300"
                      : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {step < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={next}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={finish}
                className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6"
              >
                Get Started
                <Rocket className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {step < TOTAL_STEPS && (
            <button
              type="button"
              onClick={skip}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 hover:underline cursor-pointer self-center"
            >
              Skip for now
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Small reusable pieces ---------- */

function WelcomeStep({ name }: { name?: string }) {
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-6 mb-5 shadow-inner">
        <GraduationCap className="h-14 w-14 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">
        Welcome to your learning journey
      </h2>
      <p className="text-gray-500 mt-2">
        {name ? `Hi ${name}, ` : ""}let's set up a few things so your experience
        fits you perfectly.
      </p>

      <div className="mt-8 grid w-full grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        {[
          { icon: <Wifi className="h-5 w-5 text-blue-600" />, t: "Connection" },
          { icon: <Bell className="h-5 w-5 text-green-600" />, t: "Notifications" },
          { icon: <CloudOff className="h-5 w-5 text-purple-600" />, t: "Offline sync" },
        ].map((item) => (
          <div
            key={item.t}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 py-3 font-medium text-gray-700"
          >
            {item.icon}
            {item.t}
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-gray-400">Takes less than a minute</p>
    </div>
  );
}

function StepHeader({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-3">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function SwitchRow({
  id,
  icon,
  title,
  desc,
  checked,
  onChange,
  color,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color: "blue" | "green" | "purple";
}) {
  const checkedColor = {
    blue: "data-[state=checked]:bg-blue-600",
    green: "data-[state=checked]:bg-green-600",
    purple: "data-[state=checked]:bg-purple-600",
  }[color];

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <Label htmlFor={id} className="text-base font-medium text-gray-900 cursor-pointer">
            {title}
          </Label>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className={`cursor-pointer ${checkedColor}`}
      />
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  icon,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
        selected
          ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-base font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>
      <span
        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-blue-600" : "border-gray-300"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
      </span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}