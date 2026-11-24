import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Jei page ekhono design kora hoy ni, tar jonno temporary placeholder */
export default function ComingSoon({ title, backTo }: { title: string; backTo: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <style>{`
        @keyframes cs-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes cs-float { 0%, 100% { transform: translateY(0) rotate(0) } 50% { transform: translateY(-10px) rotate(-6deg) } }
        @media (prefers-reduced-motion: reduce) { [style*="cs-"] { animation: none !important; } }
      `}</style>

      <div
        style={{ animation: "cs-fade-up 600ms cubic-bezier(.22,1,.36,1) both" }}
        className="max-w-md rounded-2xl border bg-white p-10 text-center shadow-sm"
      >
        <div
          style={{ animation: "cs-float 3.5s ease-in-out infinite" }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600"
        >
          <Hammer className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-500">This section is coming soon.</p>
        <Button
          variant="outline"
          onClick={() => navigate(backTo)}
          className="mt-6 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}