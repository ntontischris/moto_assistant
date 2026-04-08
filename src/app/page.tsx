import { createAdminClient } from "@/lib/supabase/admin";
import { getMissionState } from "@/lib/mission";
import { ClientDashboard } from "@/components/client/client-dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = createAdminClient();
  const missionState = await getMissionState(supabase);

  if (!missionState) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p style={{ color: "var(--gray-500)" }}>
          Δεν βρέθηκε mission. Επικοινωνήστε με τον διαχειριστή.
        </p>
      </div>
    );
  }

  return <ClientDashboard initialState={missionState} />;
}
