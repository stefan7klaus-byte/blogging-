import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const { message } = await req.json();

    if (typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required." }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash-lite";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "You are the Zenith Hackers Intelligence editorial assistant. Explain cybersecurity, OSINT, fraud awareness and digital-asset topics defensively and lawfully. Do not provide instructions that facilitate credential theft, malware, unauthorized access, evasion, or other harmful cyber activity. Clearly distinguish general education from professional legal, financial, or law-enforcement advice.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: message.trim() }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 700,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error:
            data?.error?.message ||
            "Gemini request failed.",
        }),
        {
          status: response.status,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "No response received.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Server error.",
      }),
      {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  }
});
