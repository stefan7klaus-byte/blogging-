import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim()) return new Response(JSON.stringify({ error: "Message is required." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
    const model = Deno.env.get("OPENAI_MODEL") || "gpt-5";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        instructions: "You are the Zenith Hackers Intelligence editorial assistant. Explain cybersecurity, OSINT, fraud awareness and digital-asset topics defensively and lawfully. Do not provide instructions that facilitate credential theft, malware, unauthorized access, evasion, or other harmful cyber activity. Clearly distinguish general education from professional legal, financial, or law-enforcement advice.",
        input: message.trim(),
        max_output_tokens: 700
      })
    });
    const data = await response.json();
    if (!response.ok) return new Response(JSON.stringify({ error: data?.error?.message || "OpenAI request failed." }), { status: response.status, headers: { ...cors, "Content-Type": "application/json" } });

    const reply = data.output_text || data.output?.flatMap(x => x.content || []).map(x => x.text || "").join("") || "No response received.";
    return new Response(JSON.stringify({ reply }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Server error." }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
