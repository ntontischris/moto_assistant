import { NextResponse } from "next/server";

export async function GET() {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs configuration missing" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { "xi-api-key": apiKey } },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get signed URL from ElevenLabs" },
        { status: 500 },
      );
    }

    const body = await response.json();

    return NextResponse.json({ signedUrl: body.signed_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
