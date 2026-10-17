import type { Context, Config } from "@netlify/functions";
import { getStore, getDeployStore } from "@netlify/blobs";

// Photo archive, filed by order number.
//   POST  /api/photos            save one photo + its details
//   GET   /api/photos?order=123  list saved photos for an order (newest first)
//   GET   /api/photos?recent=1   list the most recently photographed orders
//   GET   /api/photos?img=<key>  the photo itself (JPEG)
// Each photo is two blobs: the image ("img/<order>/<id>.jpg") and its details ("meta/<order>/<id>").

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function store() {
  // keep test deploys out of the real archive
  if (Netlify.context?.deploy?.context === "production") return getStore({ name: "qc-photos", consistency: "strong" });
  return getDeployStore({ name: "qc-photos" });
}

function checkAccess(req: Request, url: URL): Response | null {
  const code = Netlify.env.get("QC_ACCESS_CODE");
  if (!code) return json({ error: "setup", message: "QC_ACCESS_CODE is not set on the Netlify site." }, 500);
  // images are opened by <img src>, which can't send headers, so the code may come in the URL
  const given = req.headers.get("x-access-code") || url.searchParams.get("code");
  if (given !== code) return json({ error: "access" }, 401);
  return null;
}

const str = (v: unknown, n: number) => String(v ?? "").slice(0, n);
// order numbers become folder names: keep letters, digits and dashes only
const orderKey = (v: unknown) => str(v, 40).trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
const KINDS = ["sample", "first", "fail", "check", "pass", "manual"];

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const denied = checkAccess(req, url);
  if (denied) return denied;
  const s = store();

  if (req.method === "GET") {
    const img = url.searchParams.get("img");
    if (img) {
      if (!/^img\/[A-Z0-9-]+\/[A-Za-z0-9-]+\.jpg$/.test(img)) return json({ error: "bad_request" }, 400);
      const data = await s.get(img, { type: "arrayBuffer" });
      if (!data) return json({ error: "not_found" }, 404);
      return new Response(data, { headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=86400" } });
    }

    if (url.searchParams.get("recent")) {
      const { directories } = await s.list({ prefix: "meta/", directories: true });
      const orders = await Promise.all(directories.map(async (d) => {
        const { blobs } = await s.list({ prefix: d.endsWith("/") ? d : d + "/" });
        const keys = blobs.map((b) => b.key).sort();
        const last = keys.length ? await s.get(keys[keys.length - 1], { type: "json" }) : null;
        return last ? { order: last.order, customer: last.customer, machine: last.machine, ts: last.ts, count: keys.length } : null;
      }));
      return json({ orders: orders.filter(Boolean).sort((a: any, b: any) => b.ts - a.ts).slice(0, 30) });
    }

    const order = orderKey(url.searchParams.get("order"));
    if (!order) return json({ error: "bad_request", message: "Enter an order number." }, 400);
    const { blobs } = await s.list({ prefix: `meta/${order}/` });
    const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 300);
    const photos = (await Promise.all(keys.map((k) => s.get(k, { type: "json" })))).filter(Boolean);
    return json({ order, photos });
  }

  if (req.method === "POST") {
    let b: any;
    try { b = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
    const order = orderKey(b.order);
    if (!order) return json({ error: "bad_request", message: "No order number." }, 400);
    const m = typeof b.image === "string" ? b.image.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/) : null;
    if (!m || m[1].length > 4_000_000) return json({ error: "bad_request", message: "Missing or oversized image." }, 400);
    const bytes = Uint8Array.from(atob(m[1]), (c) => c.charCodeAt(0));
    const ts = Number(b.ts) || Date.now();
    const id = `${String(ts).padStart(15, "0")}-${Math.random().toString(36).slice(2, 8)}`;
    const imgKey = `img/${order}/${id}.jpg`;
    await s.set(imgKey, bytes.buffer);
    const meta = {
      id, img: imgKey, ts, order: str(b.order, 40).trim(), qty: str(b.qty, 20), customer: str(b.customer, 120), machine: str(b.machine, 80),
      kind: KINDS.includes(b.kind) ? b.kind : "manual", verdict: str(b.verdict, 12),
      summary: str(b.summary, 300), summary_es: str(b.summary_es, 300), defects: str(b.defects, 1500),
    };
    await s.setJSON(`meta/${order}/${id}`, meta);
    return json({ ok: true, id });
  }

  return json({ error: "method" }, 405);
};

export const config: Config = { path: "/api/photos" };
