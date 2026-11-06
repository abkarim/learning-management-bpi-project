import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  Wifi,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [loading, setLoading] = useState(false);

  // Demo accounts ebong tader mock permissions
  const demoAccounts = {
    Admin: {
      email: "admin@lms.com",
      password: "password",
      role: "admin",
      permissions: [
        "manage_users",
        "create_course",
        "delete_course",
        "view_reports",
      ],
    },
    Instructor: {
      email: "instructor@lms.com",
      password: "password",
      role: "instructor",
      permissions: ["create_course", "edit_own_course", "grade_students"],
    },
    Student: {
      email: "student@lms.com",
      password: "password",
      role: "student",
      permissions: ["view_courses", "submit_assignments"],
    },
  };

  const fillDemo = (roleKey: keyof typeof demoAccounts) => {
    setEmail(demoAccounts[roleKey].email);
    setPassword(demoAccounts[roleKey].password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // Backend na thakay frontend test korar jonno 1 second delay simulation pore tumi backend set kore update koro
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let matchedRole = "student";
      let permissions = ["view_courses", "submit_assignments"];
      let name = "Student User";

      if (email === "admin@lms.com") {
        matchedRole = "admin";
        permissions = demoAccounts.Admin.permissions;
        name = "Admin User";
      } else if (email === "instructor@lms.com") {
        matchedRole = "instructor";
        permissions = demoAccounts.Instructor.permissions;
        name = "Instructor User";
      } else {
        name = email.split("@")[0];
      }

      const userData = { name, email, role: matchedRole, lowBandwidth };

      // LocalStorage-e user and permissions save kore rakha jonno
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("permissions", JSON.stringify(permissions));

      toast.success(`Welcome back, ${name}!`);

      // Role onujaayi redirect kora
      if (matchedRole === "admin") {
        navigate("/admin");
      } else if (matchedRole === "instructor") {
        navigate("/instructor");
      } else {
        const onboardingDone =
          localStorage.getItem("onboardingDone") === "true";
        navigate(onboardingDone ? "/student" : "/student/onboarding");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
      <Card className="w-full max-w-md md:max-w-lg border border-red-800 rounded-2xl bg-white p-8 shadow-2xl ">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="rounded-full bg-blue-50 p-4 mb-3 shadow-inner">
            <LockKeyhole className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Learning Management System
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to access your courses
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase text-gray-600"
            >
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className="pl-10 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase text-gray-600"
            >
              Password
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-100">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-600" />
              <Label
                htmlFor="bandwidth"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Low Bandwidth Mode
              </Label>
            </div>
            <Switch
              className={"cursor-pointer"}
              id="bandwidth"
              checked={lowBandwidth}
              onCheckedChange={setLowBandwidth}
            />
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-xs cursor-pointer text-blue-600 hover:underline p-0 h-auto"
              onClick={() => toast.info("Password reset feature coming soon!")}
            >
              Forgot your password?
            </Button>
          </div>
        </form>

        <Separator className="my-5" />

        <div className="space-y-2 text-xs">
          <p className="text-center font-semibold text-gray-500 uppercase tracking-wider">
            Demo Accounts:
          </p>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5">
            {(
              Object.keys(demoAccounts) as Array<keyof typeof demoAccounts>
            ).map((roleKey) => (
              <button
                key={roleKey}
                type="button"
                onClick={() => fillDemo(roleKey)}
                className="block w-full text-left text-blue-600 hover:underline font-medium truncate"
              >
                • <strong className="text-gray-700">{roleKey}:</strong>{" "}
                {demoAccounts[roleKey].email} / {demoAccounts[roleKey].password}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-center text-xs text-blue-700 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          Frontend Mock Mode • Role-based permissions active
        </div>
      </Card>
    </div>
  );
}
