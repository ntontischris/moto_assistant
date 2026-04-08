import {
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Radio,
  Target,
} from "lucide-react";
import type { MissionStatus } from "@/types/database";

interface StatsCardsProps {
  totalSessions: number;
  openFeatureRequests: number;
  unansweredQuestions: number;
  activeSessions: number;
  missionProgress: number | null;
  missionStatus: MissionStatus | null;
}

const STATS_CONFIG = [
  {
    key: "sessions",
    label: "Sessions",
    icon: MessageSquare,
    color: "#3B82F6",
    field: "totalSessions",
  },
  {
    key: "features",
    label: "Feature Requests",
    icon: AlertCircle,
    color: "#EAB308",
    field: "openFeatureRequests",
  },
  {
    key: "unanswered",
    label: "Αναπάντητες",
    icon: HelpCircle,
    color: "var(--red)",
    field: "unansweredQuestions",
  },
  {
    key: "live",
    label: "Live",
    icon: Radio,
    color: "#22C55E",
    field: "activeSessions",
  },
] as const;

export function StatsCards({
  totalSessions,
  openFeatureRequests,
  unansweredQuestions,
  activeSessions,
}: StatsCardsProps) {
  const values: Record<string, number> = {
    totalSessions,
    openFeatureRequests,
    unansweredQuestions,
    activeSessions,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS_CONFIG.map(({ key, label, icon: Icon, color, field }) => (
        <div
          key={key}
          className="rounded-xl border p-5"
          style={{
            backgroundColor: "var(--gray-900)",
            borderColor: "var(--gray-700)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--gray-500)" }}
              >
                {label}
              </span>
              <span
                className="text-3xl font-bold"
                style={{ color: "var(--gray-100)" }}
              >
                {values[field]}
              </span>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
