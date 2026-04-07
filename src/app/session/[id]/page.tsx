import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { VoiceSession } from "@/components/voice/voice-session";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from("assistant_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!session) redirect("/");

  return <VoiceSession session={session} />;
}
