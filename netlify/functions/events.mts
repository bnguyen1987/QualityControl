import type { Context, Config } from "@netlify/functions";
import { getStore, getDeployStore } from "@netlify/blobs";

// Fail/Check alerts shared between camera stations and supervisor phones.
// Each alert is one blob keyed "ev-<timestamp>-<id>" so keys sort by time.

const KEEP = 300; // alerts kept before the oldest are removed

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function store() {
  // Keep test deploys out of the real plant alert feed
  if (Netlify.context?.deploy?.context === "production") return getStore({ name: "qc-events", consistency: "strong" });
  return getDeployStore({ name: "qc-events" });
}

function checkAccess(req: Request): Response | null {
  const code = Netlify.env.get("QC_ACCESS_CODE");
  if (!code) return json({ error: "setup", message: "QC_ACCESS_CODE is not set on the Netlify site." }, 500);
  if (req.headers.get("x-access-code") !== code) return json({ error: "access" }, 401);
  return null;
}

const str = (v: unknown, n: number) => String(v ?? "").slice(0, n);

export default async (req: Request, context: Context) => {
  const denied = checkAccess(req);
  if (denied) return denied;
  const s = store();

  if (req.method === "GET") {
    const { blobs } = await s.list({ prefix: "ev-" });
    const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 40);
    const items = await Promise.all(keys.map(async (key) => {
      const d = await s.get(key, { type: "json" });
      return d ? { id: key, ...d } : null;
    }));
    return json({ events: items.filter(Boolean) });
  }

  if (req.method === "POST") {
    let b: any;
    try { b = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
    const ts = Number(b.ts) || Date.now();
    const id = `ev-${String(ts).padStart(15, "0")}-${Math.random().toString(36).slice(2, 8)}`;
    const thumb = typeof b.thumb === "string" && b.thumb.startsWith("data:image/jpeg") && b.thumb.length < 60_000 ? b.thumb : "";
    await s.setJSON(id, {
      ts, line: str(b.line, 80), position: str(b.position, 60), job: str(b.job, 120), verdict: ["FAIL", "CHECK"].includes(b.verdict) ? b.verdict : "CHECK",
      summary: str(b.summary, 300), defects: str(b.defects, 1500), thumb, device: str(b.device, 20), ack: false,
    });
    // trim old alerts
    const { blobs } = await s.list({ prefix: "ev-" });
    if (blobs.length > KEEP) {
      const old = blobs.map((x) => x.key).sort().slice(0, blobs.length - KEEP);
      await Promise.all(old.map((k) => s.delete(k)));
    }
    return json({ id });
  }

  if (req.method === "PATCH") {
    let b: any;
    try { b = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
    const id = str(b.id, 60);
    if (!id.startsWith("ev-")) return json({ error: "bad_request" }, 400);
    const d: any = await s.get(id, { type: "json" });
    if (!d) return json({ error: "not_found" }, 404);
    await s.setJSON(id, { ...d, ack: true, ackAt: Date.now() });
    return json({ ok: true });
  }

  return json({ error: "method" }, 405);
};

export const config: Config = { path: "/api/events" };
