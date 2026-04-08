import { config } from "dotenv";
config({ path: ".env.local" });

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID!;
const WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET!;
const BASE_URL = "https://moto-assistant.vercel.app";

const tools = [
  {
    type: "webhook" as const,
    name: "save_answer",
    description:
      "Call this EVERY TIME the client answers a question. Saves the answer to the database.",
    webhook: {
      url: `${BASE_URL}/api/agent/save-answer`,
      method: "POST" as const,
      request_headers: {
        "x-webhook-secret": WEBHOOK_SECRET,
        "Content-Type": "application/json",
      },
      request_body: {
        type: "object" as const,
        properties: {
          session_id: {
            type: "string",
            description: "The session ID from dynamic variables",
          },
          section_number: {
            type: "number",
            description: "Section number 1-14",
          },
          section_name: {
            type: "string",
            description: "Greek name of the section",
          },
          question_key: {
            type: "string",
            description: "Unique key for the question",
          },
          answer_text: {
            type: "string",
            description: "The client's answer as text",
          },
        },
        required: [
          "session_id",
          "section_number",
          "section_name",
          "question_key",
          "answer_text",
        ],
      },
    },
  },
  {
    type: "webhook" as const,
    name: "update_progress",
    description: "Call this when moving to the next questionnaire section.",
    webhook: {
      url: `${BASE_URL}/api/agent/update-progress`,
      method: "POST" as const,
      request_headers: {
        "x-webhook-secret": WEBHOOK_SECRET,
        "Content-Type": "application/json",
      },
      request_body: {
        type: "object" as const,
        properties: {
          session_id: {
            type: "string",
            description: "The session ID",
          },
          section_number: {
            type: "number",
            description: "New section number 1-14",
          },
          section_name: {
            type: "string",
            description: "Greek name of the new section",
          },
        },
        required: ["session_id", "section_number", "section_name"],
      },
    },
  },
  {
    type: "webhook" as const,
    name: "log_feature_request",
    description:
      "Call this when the client asks if something can be done or requests a feature.",
    webhook: {
      url: `${BASE_URL}/api/agent/log-feature-request`,
      method: "POST" as const,
      request_headers: {
        "x-webhook-secret": WEBHOOK_SECRET,
        "Content-Type": "application/json",
      },
      request_body: {
        type: "object" as const,
        properties: {
          session_id: {
            type: "string",
            description: "The session ID",
          },
          description: {
            type: "string",
            description: "Description of the feature request",
          },
          context: {
            type: "string",
            description: "What the client said exactly",
          },
        },
        required: ["session_id", "description"],
      },
    },
  },
  {
    type: "webhook" as const,
    name: "log_issue",
    description: "Call this when the client reports a problem or bug.",
    webhook: {
      url: `${BASE_URL}/api/agent/log-issue`,
      method: "POST" as const,
      request_headers: {
        "x-webhook-secret": WEBHOOK_SECRET,
        "Content-Type": "application/json",
      },
      request_body: {
        type: "object" as const,
        properties: {
          session_id: {
            type: "string",
            description: "The session ID",
          },
          description: {
            type: "string",
            description: "Description of the issue",
          },
          context: {
            type: "string",
            description: "What the client said exactly",
          },
        },
        required: ["session_id", "description"],
      },
    },
  },
  {
    type: "webhook" as const,
    name: "log_unanswered",
    description: "Call this when you cannot answer a client's question.",
    webhook: {
      url: `${BASE_URL}/api/agent/log-unanswered`,
      method: "POST" as const,
      request_headers: {
        "x-webhook-secret": WEBHOOK_SECRET,
        "Content-Type": "application/json",
      },
      request_body: {
        type: "object" as const,
        properties: {
          session_id: {
            type: "string",
            description: "The session ID",
          },
          question: {
            type: "string",
            description: "The question you couldn't answer",
          },
          context: {
            type: "string",
            description: "Context of the conversation",
          },
        },
        required: ["session_id", "question"],
      },
    },
  },
  {
    type: "webhook" as const,
    name: "pause_session",
    description: "Call this when the client wants to stop and continue later.",
    webhook: {
      url: `${BASE_URL}/api/agent/pause-session`,
      method: "POST" as const,
      request_headers: {
        "x-webhook-secret": WEBHOOK_SECRET,
        "Content-Type": "application/json",
      },
      request_body: {
        type: "object" as const,
        properties: {
          session_id: {
            type: "string",
            description: "The session ID",
          },
          context_snapshot: {
            type: "object",
            description:
              "Snapshot with last_section (number), key_facts (array of strings), completed_sections (array of numbers), transcript_summary (string)",
          },
        },
        required: ["session_id", "context_snapshot"],
      },
    },
  },
];

async function setupTools() {
  console.log("Configuring all 6 server tools on Moto Assistant agent...\n");

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
    {
      method: "PATCH",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            prompt: {
              tools: tools,
            },
          },
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`FAILED: ${response.status}`);
    console.error(text);
    return;
  }

  console.log("All 6 tools configured successfully!");

  // Verify
  const verify = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
    {
      headers: { "xi-api-key": API_KEY },
    },
  );
  const data = await verify.json();
  const configuredTools = data.conversation_config?.agent?.prompt?.tools ?? [];
  console.log(`\nVerification: ${configuredTools.length} tools on agent`);
  for (const t of configuredTools) {
    console.log(`  - ${t.name} (${t.type})`);
  }
}

setupTools().catch(console.error);
