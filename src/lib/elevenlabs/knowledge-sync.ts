// =============================================================================
// ElevenLabs Knowledge Base sync — push/delete knowledge docs via their API.
// =============================================================================

const ELEVENLABS_API_BASE =
  "https://api.elevenlabs.io/v1/convai/knowledge-base";

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }
  return key;
}

export async function syncKnowledgeToElevenLabs(
  title: string,
  content: string,
): Promise<string> {
  const response = await fetch(ELEVENLABS_API_BASE, {
    method: "POST",
    headers: {
      "xi-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: title, text: content }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ElevenLabs sync failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return (data.id as string) ?? (data.document_id as string) ?? "";
}

export async function deleteKnowledgeFromElevenLabs(
  docId: string,
): Promise<void> {
  const response = await fetch(`${ELEVENLABS_API_BASE}/${docId}`, {
    method: "DELETE",
    headers: { "xi-api-key": getApiKey() },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ElevenLabs delete failed (${response.status}): ${text}`);
  }
}
