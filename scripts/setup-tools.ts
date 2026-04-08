import { config } from "dotenv";
config({ path: ".env.local" });

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID!;
const WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET!;
const BASE_URL = "https://moto-assistant.vercel.app";

interface SchemaProperty {
  type: string;
  description: string;
  enum?: null;
  is_system_provided?: boolean;
  dynamic_variable?: string;
  constant_value?: string;
}

interface ToolDefinition {
  type: "webhook";
  name: string;
  description: string;
  api_schema: {
    url: string;
    method: "POST";
    request_headers: Record<string, string>;
    request_body_schema: {
      type: "object";
      required: string[];
      description: string;
      properties: Record<string, SchemaProperty>;
    };
    content_type: "application/json";
  };
}

const prop = (type: string, description: string): SchemaProperty => {
  const base: SchemaProperty = {
    type,
    description,
  };
  if (type !== "object") {
    base.enum = null;
    base.is_system_provided = false;
    base.dynamic_variable = "";
    base.constant_value = "";
  }
  return base;
};

const makeTool = (
  name: string,
  description: string,
  path: string,
  properties: Record<string, SchemaProperty>,
  required: string[],
): ToolDefinition => ({
  type: "webhook",
  name,
  description,
  api_schema: {
    url: `${BASE_URL}/api/agent/${path}`,
    method: "POST",
    request_headers: {
      "x-webhook-secret": WEBHOOK_SECRET,
    },
    request_body_schema: {
      type: "object",
      required,
      description: "",
      properties,
    },
    content_type: "application/json",
  },
});

const tools: ToolDefinition[] = [
  makeTool(
    "save_answer",
    "Call this EVERY TIME the client answers a question. Saves the answer to the database.",
    "save-answer",
    {
      conversation_id: prop("string", "Conversation ID from dynamic variables"),
      section_number: prop("number", "Section number 1-14"),
      section_name: prop("string", "Greek name of the section"),
      question_key: prop("string", "Unique key for the question"),
      answer_text: prop("string", "The client's answer as text"),
    },
    [
      "conversation_id",
      "section_number",
      "section_name",
      "question_key",
      "answer_text",
    ],
  ),
  makeTool(
    "update_progress",
    "Call this when moving to the next questionnaire section.",
    "update-progress",
    {
      conversation_id: prop("string", "The Conversation ID"),
      section_number: prop("number", "New section number 1-14"),
      section_name: prop("string", "Greek name of the new section"),
    },
    ["conversation_id", "section_number", "section_name"],
  ),
  makeTool(
    "log_feature_request",
    "Call this when the client asks if something can be done or requests a feature.",
    "log-feature-request",
    {
      conversation_id: prop("string", "The Conversation ID"),
      description: prop("string", "Description of the feature request"),
      context: prop("string", "What the client said exactly"),
    },
    ["conversation_id", "description"],
  ),
  makeTool(
    "log_issue",
    "Call this when the client reports a problem or bug.",
    "log-issue",
    {
      conversation_id: prop("string", "The Conversation ID"),
      description: prop("string", "Description of the issue"),
      context: prop("string", "What the client said exactly"),
    },
    ["conversation_id", "description"],
  ),
  makeTool(
    "log_unanswered",
    "Call this when you cannot answer a client's question.",
    "log-unanswered",
    {
      conversation_id: prop("string", "The Conversation ID"),
      question: prop("string", "The question you couldn't answer"),
      context: prop("string", "Context of the conversation"),
    },
    ["conversation_id", "question"],
  ),
  makeTool(
    "pause_session",
    "Call this when the client wants to stop and continue later.",
    "pause-session",
    {
      conversation_id: prop("string", "The Conversation ID"),
      context_snapshot: prop(
        "object",
        "Snapshot with last_section (number), key_facts (array of strings), completed_sections (array of numbers), transcript_summary (string)",
      ),
    },
    ["conversation_id", "context_snapshot"],
  ),
];

async function setupTools(): Promise<void> {
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
