import type { Context, Config } from "@netlify/functions";

// Inspection checks the page can ask for. The prompt is built here, on the server,
// so this endpoint can only be used for box inspections, not general AI use.
const CHECKS: Record<string, string> = {
  print: "Print quality & registration: smears, voids, missing print, off-register colors",
  ink: "Ink color: color matches the good sample",
  score: "Slotting & scoring: slots clean and in position, scores not cracked",
  die: "Die cutting: clean cuts, no hanging trim or ragged edges",
  joint: "Glue joint: joint glued, even gap, no fishtail",
  damage: "Board damage: crushed flute, tears, warp, water damage",
  bundle: "Bundle & strapping: straps present, bundle square and even",
  tag: "Load tag: tag present and readable",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function checkAccess(req: Request): Response | null {
  const code = Netlify.env.get("QC_ACCESS_CODE");
  if (!code) return json({ error: "setup", message: "QC_ACCESS_CODE is not set on the Netlify site." }, 500);
  if (req.headers.get("x-access-code") !== code) return json({ error: "access", message: "Wrong or missing access code." }, 401);
  return null;
}

function buildPrompt(s: { line?: string; job?: string; checks?: string[]; notes?: string }, hasRef: boolean) {
  const list = (s.checks || []).filter((c) => CHECKS[c]).map((c) => "- " + CHECKS[c]).join("\n") || "- General appearance and damage";
  const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);
  return `You are the quality inspector on a corrugated box production line. A camera above the conveyor photographed one product.
${hasRef
    ? "Image 1 is the APPROVED GOOD SAMPLE from the same camera position. Image 2 is the PRODUCT TO INSPECT. Compare the product against the good sample."
    : "The image is the PRODUCT TO INSPECT. No good sample is available, so judge against normal corrugated box quality."}
Line: ${clip(s.line, 80) || "not given"}. Job: ${clip(s.job, 120) || "not given"}.
Check only these items:
${list}
${s.notes && String(s.notes).trim() ? "Job notes from the plant: " + clip(s.notes, 1500).trim() : ""}

Rules:
- Judge only what is clearly visible. Normal variation in lighting, belt position, or angle is not a defect.
- If no product is in the image, it is badly blurred, or mostly out of frame, use verdict "UNCLEAR".
- "FAIL" = a major defect that should not ship. "CHECK" = a possible or minor issue a person should look at. "PASS" = no issues seen.
Reply with only this JSON, no other text:
{"verdict":"PASS|CHECK|FAIL|UNCLEAR","summary":"one short sentence for the operator","defects":[{"check":"which check item","issue":"what is wrong and where on the box","severity":"minor|major"}],"confidence":0-100}`;
}

function parseJson(text: string) {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch {} }
  return null;
}

// Tolerate a key pasted with spaces, line breaks or quote marks around it
const getKey = () => (Netlify.env.get("ANTHROPIC_API_KEY") || "").trim().replace(/^["']|["']$/g, "").trim();

// Netlify AI Gateway injects ANTHROPIC_BASE_URL (+ a gateway key) automatically.
// If you set your own ANTHROPIC_API_KEY instead, Netlify leaves both alone and we call Anthropic directly.
const baseUrl = () => (Netlify.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com").replace(/\/+$/, "");
const viaGateway = () => !!Netlify.env.get("ANTHROPIC_BASE_URL");

export default async (req: Request, context: Context) => {
  const denied = checkAccess(req);
  if (denied) return denied;

  // GET = status check used by the page's "AI ready" indicator
  if (req.method === "GET") { const k = getKey(); return json({ ok: true, apiKey: !!k, gateway: viaGateway(), keyLooksRight: viaGateway() || k.startsWith("sk-ant-") }); }
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const apiKey = getKey();
  if (!apiKey) return json({ error: "setup", message: "ANTHROPIC_API_KEY is not set on the Netlify site." }, 500);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_request", message: "Body must be JSON." }, 400); }

  const image = typeof body.image === "string" ? body.image : "";
  const ref = typeof body.reference === "string" ? body.reference : "";
  if (!image || image.length > 3_000_000 || ref.length > 3_000_000)
    return json({ error: "bad_request", message: "Missing or oversized image." }, 400);

  const tier = body.tier === "thorough" ? "thorough" : "fast";
  const model = tier === "thorough"
    ? Netlify.env.get("QC_MODEL_THOROUGH") || "claude-sonnet-5"
    : Netlify.env.get("QC_MODEL_FAST") || "claude-haiku-4-5-20251001";

  const img = (data: string) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });
  const content: any[] = [];
  if (ref) content.push({ type: "text", text: "Image 1 (approved good sample):" }, img(ref), { type: "text", text: "Image 2 (product to inspect):" });
  content.push(img(image), { type: "text", text: buildPrompt(body.settings || {}, !!ref) });

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/v1/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 700, messages: [{ role: "user", content }] }),
    });
  } catch {
    return json({ error: "upstream", message: "Couldn't reach the AI service." }, 502);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const low = /credit balance/i.test(detail);
    const code = low ? "no_credit" : res.status === 429 ? "rate_limited" : res.status === 401 || res.status === 403 ? "bad_key" : "upstream";
    console.log("Anthropic error", res.status, detail.slice(0, 500));
    return json({ error: code, message: `AI service returned ${res.status}.`, detail: detail.slice(0, 300) }, code === "rate_limited" ? 429 : 502);
  }

  const data: any = await res.json();
  const text = (data.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n");
  const result = parseJson(text);
  if (!result) return json({ error: "invalid_json", message: "AI reply couldn't be read." }, 502);
  return json({ result, model, gateway: viaGateway() });
};

export const config: Config = { path: "/api/inspect" };
