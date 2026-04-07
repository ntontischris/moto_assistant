import { redirect } from "next/navigation";

import { PreSessionForm } from "@/components/session/pre-session-form";

interface PageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function NewSessionPage({ searchParams }: PageProps) {
  const { mode } = await searchParams;

  if (mode !== "discovery" && mode !== "support") {
    redirect("/");
  }

  const title =
    mode === "discovery" ? "Ανάλυση Απαιτήσεων" : "Υποστήριξη & Ερωτήσεις";
  const subtitle =
    mode === "discovery"
      ? "Συμπληρώστε τα στοιχεία σας για να ξεκινήσουμε το interview"
      : "Συμπληρώστε τα στοιχεία σας για να σας βοηθήσουμε";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-2 mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "var(--gray-100)" }}>
          {title}
        </h1>
        <p className="text-sm" style={{ color: "var(--gray-500)" }}>
          {subtitle}
        </p>
      </div>

      <PreSessionForm mode={mode} />
    </div>
  );
}
