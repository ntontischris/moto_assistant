import { config } from "dotenv";
config({ path: ".env.local" });

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID!;
const WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET!;
const BASE_URL = "https://moto-assistant.vercel.app";

const tools = [
  {
    name: "save_answer",
    description:
      "Call this when the client answers a question. Saves the answer to the database. Parameters: session_id (string), section_number (integer 1-14), section_name (string), question_key (string), answer_text (string), answer_structured (optional object).",
  },
  {
    name: "update_progress",
    description:
      "Call this when moving to the next questionnaire section. Parameters: session_id (string), section_number (integer 1-14), section_name (string).",
  },
  {
    name: "log_feature_request",
    description:
      "Call this when the client asks if something can be done or requests a feature. Parameters: session_id (string), description (string), context (optional string).",
  },
  {
    name: "log_issue",
    description:
      "Call this when the client reports a problem or bug with their current system. Parameters: session_id (string), description (string), context (optional string).",
  },
  {
    name: "log_unanswered",
    description:
      "Call this when you cannot answer a client question. Parameters: session_id (string), question (string), context (optional string).",
  },
  {
    name: "pause_session",
    description:
      "Call this when the client wants to stop and continue later. Parameters: session_id (string), context_snapshot (object with last_section, key_facts array, completed_sections array, transcript_summary string).",
  },
];

async function setupTools() {
  console.log("Setting up server tools for Moto Assistant...\n");

  for (const tool of tools) {
    const endpoint = `${BASE_URL}/api/agent/${tool.name.replace(/_/g, "-")}`;

    console.log(`Creating tool: ${tool.name} → ${endpoint}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: "PATCH",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform_settings: {
            tools: [
              {
                type: "webhook",
                name: tool.name,
                description: tool.description,
                api_schema: {
                  url: endpoint,
                  method: "POST",
                  headers: {
                    "x-webhook-secret": WEBHOOK_SECRET,
                    "Content-Type": "application/json",
                  },
                },
              },
            ],
          },
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(`  FAILED: ${response.status} — ${text}`);
    } else {
      console.log(`  OK`);
    }
  }

  console.log("\nDone! Tools configured.");
}

setupTools().catch(console.error);
