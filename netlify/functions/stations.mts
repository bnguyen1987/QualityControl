import type { Context, Config } from "@netlify/functions";
import { getStore, getDeployStore } from "@netlify/blobs";

// Camera stations report in here (status, run counts, last result, a small snapshot).
// The dashboard reads every station from here. One blob per station: "st-<deviceId>".

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function store() {
  if (Netlify.context?.deploy?.context === "production") return getStore({ name: "qc-stations", consistency: "strong" });
  return getDeployStore({ name: "qc-stations" });
}

function checkAccess(req: Request): Response | null {
  const code = Netlify.env.get("QC_ACCESS_CODE");
  if (!code) return json({ error: "setup", message: "QC_ACCESS_CODE is not set on the Netlify site." }, 500);
  if (req.headers.get("x-access-code") !== code) return json({ error: "access" }, 401);
  return null;
}

const str = (v: unknown, n: number) => String(v ?? "").slice(0, n);
const num = (v: unknown) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : 0);
const img = (v: unknown, max: number) => (typeof v === "string" && v.startsWith("data:image/jpeg") && v.length < max ? v : "");
const cleanId = (v: unknown) => str(v, 24).replace(/[^a-z0-9]/gi, "");

export default async (req: Request, context: Context) => {
  const denied = checkAccess(req);
  if (denied) return denied;
  const s = store();

  if (req.method === "GET") {
    const { blobs } = await s.list({ prefix: "st-" });
    const stations = (await Promise.all(blobs.map((b) => s.get(b.key, { type: "json" })))).filter(Boolean);
    return json({ now: Date.now(), stations });
  }

  if (req.method === "POST") {
    let b: any;
    try { b = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
    const id = cleanId(b.id);
    if (!id) return json({ error: "bad_request" }, 400);
    const c = b.counts || {};
    const last = b.last && typeof b.last === "object" ? {
      verdict: str(b.last.verdict, 12), summary: str(b.last.summary, 300), ts: num(b.last.ts), thumb: img(b.last.thumb, 60_000),
    } : null;
    await s.setJSON("st-" + id, {
      id, machine: str(b.machine, 80) || "Unassigned", position: str(b.position, 60) || "Camera", job: str(b.job, 120),
      camOn: !!b.camOn, armed: !!b.armed, aiReady: !!b.aiReady,
      counts: { seen: num(c.seen), insp: num(c.insp), pass: num(c.pass), check: num(c.check), fail: num(c.fail), captured: num(c.captured) },
      last, snap: img(b.snap, 120_000), lastSeen: Date.now(),
    });
    return json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = cleanId(new URL(req.url).searchParams.get("id"));
    if (!id) return json({ error: "bad_request" }, 400);
    await s.delete("st-" + id);
    return json({ ok: true });
  }

  return json({ error: "method" }, 405);
};

export const config: Config = { path: "/api/stations" };
