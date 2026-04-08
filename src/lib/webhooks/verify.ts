import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

function getElevenLabs() {
  return new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
}

export async function verifyElevenLabsWebhook(
  rawBody: string,
  signature: string,
) {
  const elevenlabs = getElevenLabs();
  return elevenlabs.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.ELEVENLABS_WEBHOOK_SECRET!,
  );
}

export function verifyAgentWebhook(request: Request): boolean {
  const secret = request.headers.get("x-webhook-secret");
  return secret === process.env.ELEVENLABS_WEBHOOK_SECRET;
}
