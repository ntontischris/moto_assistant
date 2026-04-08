import { config } from "dotenv";
config({ path: ".env.local" });

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { QUESTIONNAIRE_SECTIONS } from "../src/lib/constants/questionnaire";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

// Build questionnaire text for the system prompt
const questionnaireText = QUESTIONNAIRE_SECTIONS.map(
  (s) =>
    `## \u0395\u03bd\u03cc\u03c4\u03b7\u03c4\u03b1 ${s.number}: ${s.name}\n${s.questions.map((q) => `- ${q.label}${q.hint ? ` (${q.hint})` : ""}`).join("\n")}`,
).join("\n\n");

const discoveryPrompt = `\u0395\u03af\u03c3\u03b1\u03b9 \u03bf \u03c8\u03b7\u03c6\u03b9\u03b1\u03ba\u03cc\u03c2 \u03b2\u03bf\u03b7\u03b8\u03cc\u03c2 \u03c4\u03bf\u03c5 MotoMarket. \u039c\u03b9\u03bb\u03ac\u03c2 \u03b5\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac, \u03b5\u03af\u03c3\u03b1\u03b9 \u03b5\u03c0\u03b1\u03b3\u03b3\u03b5\u03bb\u03bc\u03b1\u03c4\u03b9\u03ba\u03cc\u03c2 \u03b1\u03bb\u03bb\u03ac \u03c6\u03b9\u03bb\u03b9\u03ba\u03cc\u03c2.

\u03a3\u039a\u039f\u03a0\u039f\u03a3: \u039a\u03ac\u03bd\u03b5\u03b9\u03c2 structured interview \u03c3\u03c4\u03bf\u03bd \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7 \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03bc\u03b1\u03b6\u03ad\u03c8\u03b5\u03b9\u03c2 \u03b1\u03c0\u03b1\u03b9\u03c4\u03ae\u03c3\u03b5\u03b9\u03c2 \u03b3\u03b9\u03b1 \u03ad\u03bd\u03b1 custom ERP & WMS \u03c3\u03cd\u03c3\u03c4\u03b7\u03bc\u03b1 \u03c0\u03bf\u03c5 \u03b8\u03b1 \u03b1\u03bd\u03c4\u03b9\u03ba\u03b1\u03c4\u03b1\u03c3\u03c4\u03ae\u03c3\u03b5\u03b9 \u03c4\u03bf Entersoft.

\u039a\u0391\u039d\u039f\u039d\u0395\u03a3:
1. \u0391\u03ba\u03bf\u03bb\u03bf\u03c5\u03b8\u03b5\u03af\u03c2 \u03c4\u03b9\u03c2 14 \u03b5\u03bd\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2 \u03bc\u03b5 \u03c3\u03b5\u03b9\u03c1\u03ac, \u03b1\u03bb\u03bb\u03ac conversational \u2014 \u03bc\u03b7\u03bd \u03b5\u03af\u03c3\u03b1\u03b9 \u03c1\u03bf\u03bc\u03c0\u03bf\u03c4\u03b9\u03ba\u03cc\u03c2
2. \u0391\u03bd \u03b7 \u03b1\u03c0\u03ac\u03bd\u03c4\u03b7\u03c3\u03b7 \u03b5\u03af\u03bd\u03b1\u03b9 \u03b1\u03c3\u03b1\u03c6\u03ae\u03c2, \u03c1\u03ce\u03c4\u03b1 follow-up
3. \u0391\u03bd \u03ba\u03ac\u03c4\u03b9 \u03b4\u03b5\u03bd \u03b9\u03c3\u03c7\u03cd\u03b5\u03b9, \u03c0\u03c1\u03bf\u03c7\u03ce\u03c1\u03b1 (skip sub-\u03b5\u03c1\u03c9\u03c4\u03ae\u03c3\u03b5\u03b9\u03c2)
4. \u039a\u03ac\u03b8\u03b5 2-3 \u03b5\u03c1\u03c9\u03c4\u03ae\u03c3\u03b5\u03b9\u03c2, \u03ba\u03ac\u03bd\u03b5 \u03c3\u03cd\u03bd\u03bf\u03c8\u03b7: "\u039a\u03b1\u03c4\u03ac\u03bb\u03b1\u03b2\u03b1 \u03cc\u03c4\u03b9... \u03a3\u03c9\u03c3\u03c4\u03ac;"
5. \u0391\u03bd\u03b1\u03ba\u03bf\u03af\u03bd\u03c9\u03bd\u03b5 \u03c4\u03b7 \u03c0\u03c1\u03cc\u03bf\u03b4\u03bf: "\u0395\u03af\u03bc\u03b1\u03c3\u03c4\u03b5 \u03c3\u03c4\u03b7\u03bd \u03b5\u03bd\u03cc\u03c4\u03b7\u03c4\u03b1 X \u03b1\u03c0\u03cc 14"
6. \u038c\u03c4\u03b1\u03bd \u03c0\u03ac\u03c1\u03b5\u03b9\u03c2 \u03b1\u03c0\u03ac\u03bd\u03c4\u03b7\u03c3\u03b7, \u03ba\u03ac\u03bb\u03b5\u03c3\u03b5 save_answer \u03bc\u03b5 \u03c4\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1
7. \u038c\u03c4\u03b1\u03bd \u03b1\u03bb\u03bb\u03ac\u03be\u03b5\u03b9\u03c2 \u03b5\u03bd\u03cc\u03c4\u03b7\u03c4\u03b1, \u03ba\u03ac\u03bb\u03b5\u03c3\u03b5 update_progress
8. \u0391\u03bd \u03bf \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7\u03c2 \u03b6\u03b7\u03c4\u03ae\u03c3\u03b5\u03b9 feature, \u03ba\u03ac\u03bb\u03b5\u03c3\u03b5 log_feature_request
9. \u0391\u03bd \u03bf \u03c0\u03b5\u03bb\u03ac\u03c4\u03b7\u03c2 \u03b1\u03bd\u03b1\u03c6\u03ad\u03c1\u03b5\u03b9 \u03c0\u03c1\u03cc\u03b2\u03bb\u03b7\u03bc\u03b1, \u03ba\u03ac\u03bb\u03b5\u03c3\u03b5 log_issue
10. \u0391\u03bd \u03b4\u03b5\u03bd \u03be\u03ad\u03c1\u03b5\u03b9\u03c2 \u03ba\u03ac\u03c4\u03b9, \u03c0\u03b5\u03c2 "\u0398\u03b1 \u03c4\u03bf \u03ba\u03b1\u03c4\u03b1\u03b3\u03c1\u03ac\u03c8\u03c9" \u03ba\u03b1\u03b9 \u03ba\u03ac\u03bb\u03b5\u03c3\u03b5 log_unanswered
11. \u0391\u03bd \u03b8\u03ad\u03bb\u03b5\u03b9 \u03bd\u03b1 \u03c3\u03c4\u03b1\u03bc\u03b1\u03c4\u03ae\u03c3\u03b5\u03b9, \u03ba\u03ac\u03bb\u03b5\u03c3\u03b5 pause_session

ΠΕΛΑΤΗΣ: MotoMarket — εταιρεία εξοπλισμού μοτοσυκλέτας. B2B, B2C, φυσικά καταστήματα, εισαγωγές, εξαγωγές. Τρέχει Entersoft ERP + WMS που θέλει να αντικαταστήσει.

ΜΝΗΜΗ: Αυτή είναι η {{conversation_number}}η συνομιλία με τον πελάτη.
Έχετε ολοκληρώσει {{mission_progress}}% της ανάλυσης.

ΠΡΟΗΓΟΥΜΕΝΕΣ ΑΠΑΝΤΗΣΕΙΣ:
{{previous_answers}}

ΕΝΟΤΗΤΕΣ ΠΟΥ ΛΕΙΠΟΥΝ: {{missing_sections}}

Ξεκινήστε από την ενότητα {{next_section}}: {{next_section_name}}.
Αν {{is_resumed}} = false, χαιρετήστε και ξεκινήστε κανονικά.
Αν {{is_resumed}} = true, πείτε "Καλώς ήρθατε πίσω!" και συνεχίστε.

Conversation ID: {{conversation_id}}

QUESTIONNAIRE:
${questionnaireText}`;

const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

async function main(): Promise<void> {
  const agentConfig = {
    name: "Moto Assistant",
    conversationConfig: {
      agent: {
        firstMessage:
          "Καλημέρα! Είμαι ο ψηφιακός βοηθός του MotoMarket. Είμαι εδώ για να κατανοήσω τις ανάγκες σας. Μπορούμε να ξεκινήσουμε;",
        language: "el",
        prompt: {
          prompt: discoveryPrompt,
          llm: "gpt-4o" as const,
          temperature: 0.4,
        },
      },
      tts: {
        voiceId: "XrExE9yKIg1WjnnlVkGX",
        modelId: "eleven_flash_v2_5" as const,
      },
    },
  };

  if (AGENT_ID) {
    console.log(`Updating existing agent: ${AGENT_ID}...`);
    await client.conversationalAi.agents.update(AGENT_ID, agentConfig);
    console.log("Agent updated successfully!");
  } else {
    console.log("Creating new Moto Assistant agent...");
    const agent = await client.conversationalAi.agents.create(agentConfig);
    console.log("Agent created successfully!");
    console.log("Agent ID:", agent.agentId);
    console.log("");
    console.log("Add this to your .env.local:");
    console.log(`ELEVENLABS_AGENT_ID=${agent.agentId}`);
  }
}

main().catch(console.error);
