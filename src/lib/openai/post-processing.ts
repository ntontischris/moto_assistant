import OpenAI from "openai";

import {
  QUESTIONNAIRE_SECTIONS,
  type QuestionnaireSection,
} from "@/lib/constants/questionnaire";
import type { SessionMode } from "@/types/database";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MissingQuestion {
  section: number;
  question: string;
}

interface GapAnalysis {
  missingSections: number[];
  missingQuestions: MissingQuestion[];
  completionPercentage: number;
}

interface ExtractedItem {
  description: string;
  context: string;
}

export interface PostProcessingResult {
  summary: string;
  gapAnalysis: GapAnalysis;
  extractedFeatureRequests: ExtractedItem[];
  extractedIssues: ExtractedItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAllQuestionKeys(): Map<string, number> {
  const keys = new Map<string, number>();
  for (const section of QUESTIONNAIRE_SECTIONS) {
    for (const q of section.questions) {
      keys.set(q.key, section.number);
    }
  }
  return keys;
}

function buildGapAnalysis(existingAnswerKeys: string[]): GapAnalysis {
  const allKeys = getAllQuestionKeys();
  const answeredSet = new Set(existingAnswerKeys);

  const missingQuestions: MissingQuestion[] = [];
  const sectionHits = new Map<number, { total: number; answered: number }>();

  for (const section of QUESTIONNAIRE_SECTIONS) {
    sectionHits.set(section.number, {
      total: section.questions.length,
      answered: 0,
    });
  }

  for (const [key, sectionNum] of allKeys) {
    if (answeredSet.has(key)) {
      const hit = sectionHits.get(sectionNum)!;
      hit.answered += 1;
    } else {
      const section = QUESTIONNAIRE_SECTIONS.find(
        (s: QuestionnaireSection) => s.number === sectionNum,
      );
      missingQuestions.push({
        section: sectionNum,
        question: section?.questions.find((q) => q.key === key)?.label ?? key,
      });
    }
  }

  const missingSections: number[] = [];
  for (const [sectionNum, { answered }] of sectionHits) {
    if (answered === 0) {
      missingSections.push(sectionNum);
    }
  }

  const totalQuestions = allKeys.size;
  const answeredCount = existingAnswerKeys.filter((k) => allKeys.has(k)).length;
  const completionPercentage =
    totalQuestions === 0
      ? 100
      : Math.round((answeredCount / totalQuestions) * 100);

  return { missingSections, missingQuestions, completionPercentage };
}

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------

const DISCOVERY_SYSTEM_PROMPT = `You are a post-processing assistant for MotoMarket's ERP discovery calls.
You receive the full transcript of a voice call conducted in Greek with a prospective client.

Your tasks:
1. Write a concise summary (3-6 bullet points) in Greek describing what was discussed and key findings.
2. Extract any feature requests the client mentioned — things they wish the new ERP could do.
3. Extract any issues or pain points the client described with their current setup.

Respond ONLY with valid JSON matching this schema:
{
  "summary": "string — bullet points in Greek, separated by newlines",
  "featureRequests": [{ "description": "string", "context": "string — quote or paraphrase from transcript" }],
  "issues": [{ "description": "string", "context": "string — quote or paraphrase from transcript" }]
}`;

const SUPPORT_SYSTEM_PROMPT = `You are a post-processing assistant for MotoMarket's support calls.
You receive the full transcript of a voice call conducted in Greek with an existing client.

Your tasks:
1. Write a concise summary (3-6 bullet points) in Greek describing the support topics discussed.
2. Extract any feature requests or enhancement suggestions the client mentioned.
3. Extract any issues or bugs the client reported.

Respond ONLY with valid JSON matching this schema:
{
  "summary": "string — bullet points in Greek, separated by newlines",
  "featureRequests": [{ "description": "string", "context": "string — quote or paraphrase from transcript" }],
  "issues": [{ "description": "string", "context": "string — quote or paraphrase from transcript" }]
}`;

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

interface LlmResponse {
  summary: string;
  featureRequests: ExtractedItem[];
  issues: ExtractedItem[];
}

export async function processTranscript(
  transcript: string,
  mode: SessionMode,
  existingAnswerKeys: string[],
): Promise<PostProcessingResult> {
  const systemPrompt =
    mode === "discovery" ? DISCOVERY_SYSTEM_PROMPT : SUPPORT_SYSTEM_PROMPT;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed: LlmResponse = JSON.parse(raw);

  const gapAnalysis = buildGapAnalysis(existingAnswerKeys);

  return {
    summary: parsed.summary ?? "",
    gapAnalysis,
    extractedFeatureRequests: parsed.featureRequests ?? [],
    extractedIssues: parsed.issues ?? [],
  };
}
