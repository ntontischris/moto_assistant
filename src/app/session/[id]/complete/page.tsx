import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { TOTAL_SECTIONS } from "@/lib/constants/questionnaire";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompletePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from("assistant_sessions")
    .select("id, status, progress_section, resume_token")
    .eq("id", id)
    .single();

  if (!session) redirect("/");

  const isCompleted = session.status === "completed";
  const isPaused = session.status === "paused";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <CheckCircle size={64} className="mb-6 text-green-400" />

      <h1 className="mb-2 text-3xl font-bold text-[var(--gray-100)]">
        Thank you!
      </h1>

      {isCompleted && (
        <p className="mb-4 text-[var(--gray-300)]">The analysis is complete.</p>
      )}

      {isPaused && (
        <div className="mb-4 flex flex-col items-center gap-3">
          <p className="text-[var(--gray-300)]">
            You completed {session.progress_section}/{TOTAL_SECTIONS} sections.
          </p>
          <Link
            href={`/resume/${session.resume_token}`}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--red)" }}
          >
            Resume Session
          </Link>
        </div>
      )}

      <p className="mb-8 text-sm text-[var(--gray-500)]">
        You will receive an email with the summary.
      </p>

      <Link
        href="/"
        className="text-sm text-[var(--gray-400)] underline underline-offset-4 transition-colors hover:text-[var(--gray-200)]"
      >
        Back to Home
      </Link>
    </div>
  );
}
